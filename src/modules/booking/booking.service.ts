import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AvailabilityService } from '../availability/availability.service';
import { CreateBookingDTO } from './dto/create-booking.dto';
import { ServiceService } from '../service/service.service';
import { CouponService } from '../coupon/coupon.service';
import { isEqual } from 'date-fns';
import { AbacateService } from '../abacate/abacate.service';
import { BookingStatus, DiscountType, Service, User } from '@prisma/client';
import { UserService } from '../user/user.service';
import { BookingModule } from './booking.module';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class BookingService {
    constructor(
        private readonly prismaService: PrismaService, 
        private readonly availabilityService: AvailabilityService,
        private readonly serviceService: ServiceService,
        private readonly couponService: CouponService,
        private readonly abacateService: AbacateService,
        private readonly userService: UserService,
        private readonly subscriptionService: SubscriptionService
    ){}


    async create(data: CreateBookingDTO, userId: string ){ 
        const [service, user, { hasActiveSubscription, subscription}] = await Promise.all([ this.serviceService.readOne(data.serviceId), this.userService.readOne(userId), this.subscriptionService.readActiveSubscription(userId) ])
        const isSlotAvailable = await this.availabilityService.readSlot({bookingDate: data.bookingDate, bookingTime: data.bookingTime, numberOfPeople: data.numberOfPeople, serviceId: data.serviceId})
        if (!isSlotAvailable) throw new BadRequestException('Horário indisponível.')
            

        if(data.paymentType === 'DEPOSIT'){ 
            const result = await this.createBookingPayment(data, service, user)
            return { 
                message: "Agendamento criado. Aguardando confirmação do pagamento.", 
                payment: result.abacatePayment
            }
        }
        
        if(hasActiveSubscription && subscription && subscription.bookingsRemaining > 0 && data.numberOfPeople === 1){
            
        }

        
    }
        
    private async createBookingPayment(data: CreateBookingDTO, service: Service, user: User){ 
        let finalPrice = service.priceCents * data.numberOfPeople
        let discount = 0

        if(data.couponCode){ 
            const discountValue = await this.couponService.useCoupon( finalPrice, data.couponCode )
            discount = discountValue.discount
            finalPrice = discountValue.finalPrice 
        }
        const result = await this.prismaService.$transaction(async (tx) => {
    
            const booking = await tx.booking.create({ 
                data: {  
                    ...data,  
                    bookingDate: this.parseDate(data.bookingDate),
                     userId: user.id, originalPriceCents: service.priceCents * data.numberOfPeople, 
                     finalPriceCents: finalPrice, 
                     discountCents: discount, 
                     status: BookingStatus.PENDING 
                }
            })

            const abacatePayment = await this.abacateService.createPayment({   
                customer: { 
                  cellphone: user.phone, 
                  email: user.email, 
                  name: user.name, 
                  taxId: user.cpf
                }, 
                price: finalPrice
            })

            const payment = await tx.payment.create({ 
                data: { 
                  amountCents: finalPrice, 
                  bookingId: booking.id, 
                  paymentType: data.paymentType, 
                  provider: "abacatepay", 
                  providerPaymentId: abacatePayment.data.id,
                  qrCodeUrl: abacatePayment.data.brCodeBase64, 
                  paymentUrl: abacatePayment.data.brCode,
                  createdBy: user.id
                }
            })

            return { booking, payment, abacatePayment }
        })
        return result
    }

    async calculateBookingDiscount(bookingPrice: number, couponCode: string){ 
        const coupon = await this.couponService.readOne(couponCode)
        if(!coupon.isActive) throw new BadRequestException("Cupom inválido.")
        if(coupon.discountType === DiscountType.FIXED){ 
            return bookingPrice - coupon.discountValue
        }
    }

    private parseDate(dateStr: string): Date {
        const [year, month, day] = dateStr.split('-').map(Number)
        return new Date(year, month - 1, day)
    }

    

}
