import { Injectable } from '@nestjs/common';
import { addMonths } from 'date-fns';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class WebhookService {
  constructor(private readonly prismaService: PrismaService, ){}

  async updatePayment(payload: any){ 
        const payment = await this.prismaService.payment.findFirst({ where: { providerPaymentId: payload.data.pixQrCode.id } })
        if(!payment) return 
        
        if(payment.bookingId){ 
          const updatedBooking = await this.prismaService.booking.update({ where: { id: payment.bookingId }, data: { status: 'CONFIRMED' } } )
          const updatedPayment = await this.prismaService.payment.update( { where: { id: payment.id }, data: { status: 'PAID' } } )
          console.log(`Booking ${updatedBooking.id} pago. Atualizado com sucesso.`)
        }
        
        if(payment.subscriptionId){ 
          const date = new Date(Date.now()) 
          const updatedSubscription = await this.prismaService.subscription.update({ 
            where: { id: payment.subscriptionId },
            data: { startDate: date, endDate: addMonths(date, 1), status: 'ACTIVE' }
          })
          const updatedPayment = await this.prismaService.payment.update({ where: { id: payment.id }, data: { status: 'PAID' } } )
          console.log(`Inscrição ${updatedSubscription.id} paga. Atualizada com sucesso.`)
        }
  }
}
