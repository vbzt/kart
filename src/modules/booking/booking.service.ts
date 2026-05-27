import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, Service, Subscription, User } from '@prisma/client';
import { JwtUserPayload } from 'src/common/types/jwt-payload';
import { AbacateService } from '../abacate/abacate.service';
import { AvailabilityService } from '../availability/availability.service';
import { CouponService } from '../coupon/coupon.service';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceService } from '../service/service.service';
import { UserService } from '../user/user.service';
import { CreateBookingDTO } from './dto/create-booking.dto';

@Injectable()
export class BookingService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly availabilityService: AvailabilityService,
    private readonly serviceService: ServiceService,
    private readonly couponService: CouponService,
    private readonly abacateService: AbacateService,
    private readonly userService: UserService,
  ) {}

  async create(data: CreateBookingDTO, { userId }: JwtUserPayload) {
    this.assertBookingDateMatchesTime(data);

    if (data.paymentType !== 'DEPOSIT') {
      throw new BadRequestException(
        'Use POST /booking/subscription para reservas com assinatura.',
      );
    }

    const [service, user] = await Promise.all([
      this.serviceService.readOne(data.serviceId),
      this.userService.readOne(userId),
    ]);

    const numberOfPeople = data.numberOfPeople ?? 1;
    const isSlotAvailable = await this.availabilityService.readSlot({
      bookingDate: data.bookingDate,
      bookingTime: data.bookingTime,
      numberOfPeople,
      serviceId: data.serviceId,
    });
    if (!isSlotAvailable) throw new BadRequestException('Horário indisponível.');

    const result = await this.createBookingPayment(data, service, user);
    return {
      message: 'Agendamento criado. Aguardando confirmação do pagamento.',
      booking: result.booking,
      payment: result.abacatePayment,
      pricing: {
        originalPriceCents: result.booking.originalPriceCents,
        discountCents: result.booking.discountCents,
        finalPriceCents: result.booking.finalPriceCents,
      },
    };
  }

  async readOne(id: string, userId: string) {
    const booking = await this.prismaService.booking.findFirst({
      where: { id, userId },
    });
    if (!booking) throw new NotFoundException('Este agendamento não existe.');
    return booking;
  }

  async readUserBookings(user: JwtUserPayload) {
    return this.prismaService.booking.findMany({
      where: { userId: user.userId },
      orderBy: [{ bookingDate: 'desc' }, { bookingTime: 'desc' }],
    });
  }

  async createBookingWithCredits(
    subscription: Subscription,
    user: JwtUserPayload,
    data: CreateBookingDTO,
  ) {
    this.assertBookingDateMatchesTime(data);
    const numberOfPeople = data.numberOfPeople ?? 1;

    if (subscription.creditsTotal <= 0) {
      throw new BadRequestException(
        'Os créditos desta inscrição estão esgotados.',
      );
    }
    if (numberOfPeople !== 1) {
      throw new BadRequestException(
        'Reservas com créditos permitem apenas 1 pessoa.',
      );
    }

    const isSlotAvailable = await this.availabilityService.readSlot({
      bookingDate: data.bookingDate,
      bookingTime: data.bookingTime,
      numberOfPeople,
      serviceId: data.serviceId,
    });
    if (!isSlotAvailable) throw new BadRequestException('Horário indisponível.');

    const booking = await this.prismaService.$transaction(async (tx) => {
      const createdBooking = await tx.booking.create({
        data: {
          bookingDate: this.parseDate(data.bookingDate),
          bookingTime: data.bookingTime,
          serviceId: data.serviceId,
          numberOfPeople,
          status: BookingStatus.PAID,
          userId: user.userId,
          subscriptionId: subscription.id,
        },
      });

      await tx.creditTransaction.create({
        data: {
          type: 'USE',
          bookingId: createdBooking.id,
          subscriptionId: subscription.id,
          description: 'Crédito usado em reserva.',
        },
      });

      await tx.subscription.update({
        where: { id: subscription.id },
        data: { creditsTotal: { decrement: 1 } },
      });

      return createdBooking;
    });

    return { booking, message: 'Agendamento criado.' };
  }

  private async createBookingPayment(
    data: CreateBookingDTO,
    service: Service,
    user: User,
  ) {
    const numberOfPeople = data.numberOfPeople ?? 1;
    const originalPrice = service.priceCents * numberOfPeople;

    return this.prismaService.$transaction(async (tx) => {
      let finalPrice = originalPrice;
      let discount = 0;

      if (data.couponCode) {
        const discountValue = await this.couponService.useCoupon(
          finalPrice,
          data.couponCode,
          tx,
        );
        discount = discountValue.discount;
        finalPrice = discountValue.finalPrice;
      }

      const abacatePayment = await this.abacateService.createPayment(
        { amount: finalPrice },
        { email: user.email, userId: user.id, role: user.role },
      );

      const booking = await tx.booking.create({
        data: {
          serviceId: data.serviceId,
          bookingDate: this.parseDate(data.bookingDate),
          bookingTime: data.bookingTime,
          numberOfPeople,
          couponCode: data.couponCode,
          howDidYouKnow: data.howDidYouKnow,
          experienceLevel: data.experienceLevel,
          notes: data.notes,
          userId: user.id,
          originalPriceCents: originalPrice,
          finalPriceCents: finalPrice,
          discountCents: discount,
          status: BookingStatus.PENDING,
        },
      });

      const payment = await tx.payment.create({
        data: {
          amountCents: finalPrice,
          bookingId: booking.id,
          paymentType: data.paymentType,
          provider: 'abacatepay',
          providerPaymentId: abacatePayment.data.id,
          qrCodeUrl: abacatePayment.data.brCodeBase64,
          paymentUrl: abacatePayment.data.brCode,
          providerMetadata: abacatePayment.data,
          createdBy: user.id,
        },
      });

      return { booking, payment, abacatePayment };
    });
  }

  private parseDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private assertBookingDateMatchesTime(data: CreateBookingDTO) {
    const [year, month, day] = data.bookingDate.split('-').map(Number);
    const sameLocalDate =
      data.bookingTime.getFullYear() === year &&
      data.bookingTime.getMonth() === month - 1 &&
      data.bookingTime.getDate() === day;

    if (!sameLocalDate) {
      throw new BadRequestException(
        'Data de agendamento e horário de agendamento devem ser no mesmo dia.',
      );
    }
  }
}
