import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AvailabilityService } from '../availability/availability.service';
import { CreateBookingDTO } from './dto/create-booking.dto';
import { ServiceService } from '../service/service.service';
import { CouponService } from '../coupon/coupon.service';
import { isEqual } from 'date-fns';
import { AbacateService } from '../abacate/abacate.service';
import { DiscountType } from '@prisma/client';
import { UserService } from '../user/user.service';
import { BookingModule } from './booking.module';

@Injectable()
export class BookingService {
    constructor(
        private readonly prismaService: PrismaService, 
        private readonly availabilityService: AvailabilityService,
        private readonly serviceService: ServiceService,
        private readonly couponService: CouponService,
        private readonly abacateService: AbacateService,
        private readonly userService: UserService
    ){}


    async create(data: CreateBookingDTO, userId: string){ 
        const service = await this.serviceService.readOne(data.serviceId)
        const availabilitySlots = await this.availabilityService.getAvailability({ serviceId: data.serviceId, date: data.bookingDate })
        if(availabilitySlots.length === 0) throw new BadRequestException("Data indisponível.") 
        const slot = availabilitySlots.find(s => isEqual(s.startTime, data.bookingTime))
        if (!slot || slot.availableKarts < data.numberOfPeople) throw new BadRequestException('Horário indisponível.')

        const [year, month, day] = data.bookingDate.split('-').map(Number)
        const bookingDateAsDate = new Date(year, month - 1, day)
        
        
        const price = service.priceCents * data.numberOfPeople
        data.originalPriceCents = price
        data.finalPriceCents = price

        if(data.couponCode){ 
            const discountValue = await this.couponService.useCoupon( price, data.couponCode )
            data.discountCents = discountValue.discount
            data.finalPriceCents = discountValue.finalPrice 
        }

        const user = await this.userService.readOne(userId)
        const abacatePayment = await this.abacateService.createPayment( {   
            customer: { cellphone: user.phone, email: user.email, name: user.name, taxId: user.cpf}, 
            price: data.finalPriceCents
         })

        const booking = await this.prismaService.booking.create( { data: { ...data, bookingDate: bookingDateAsDate,  userId } } )
        const payment = await this.prismaService.payment.create( { data: { amountCents: data.finalPriceCents, bookingId: booking.id, paymentType: 'DEPOSIT', provider: "abacatepay", providerPaymentId: abacatePayment.data.id ,qrCodeUrl: abacatePayment.data.brCodeBase64, paymentUrl: abacatePayment.data.brCode}})
        return { message: "Agendamento será criado após confirmação do pagamento.", payment: abacatePayment}
    }
        


    async calculateBookingDiscount(bookingPrice: number, couponCode: string){ 
        const coupon = await this.couponService.readOne(couponCode)
        if(!coupon.isActive) throw new BadRequestException("Cupom inválido.")
        if(coupon.discountType === DiscountType.FIXED){ 
            return bookingPrice - coupon.discountValue
        }
    }

}
