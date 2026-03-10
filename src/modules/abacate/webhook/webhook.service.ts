import { Injectable } from '@nestjs/common';
import { addMonths } from 'date-fns';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class WebhookService {
  constructor(private readonly prismaService: PrismaService, ){}

  async updatePayment(payload: any){ 
        const providerPaymentId = payload?.data?.pixQrCode?.id
        if(!providerPaymentId) return { received: true }

        return await this.prismaService.$transaction(async (tx) => {
          const payment = await tx.payment.findFirst({
            where: { provider: 'abacatepay', providerPaymentId }
          })

          if(!payment) return { received: true, ignored: true }

          await tx.payment.updateMany({
            where: {
              id: payment.id,
              OR: [{ status: { not: 'PAID' } }, { paidAt: null }],
            },
            data: { status: 'PAID', paidAt: new Date() }
          })

          const freshPayment = await tx.payment.findUnique({ where: { id: payment.id } })
          const paidAt = freshPayment?.paidAt ?? new Date()

          if(payment.bookingId){ 
            const updated = await tx.booking.updateMany({
              where: { id: payment.bookingId, status: 'PENDING' },
              data: { status: 'CONFIRMED' }
            })
            if(updated.count > 0) {
              console.log(`Booking ${payment.bookingId} pago. Atualizado com sucesso.`)
            }
          }
          
          if(payment.subscriptionId){ 
            const subscription = await tx.subscription.findUnique({ where: { id: payment.subscriptionId } })
            if(subscription){
              const nextStart = paidAt
              const nextEnd = addMonths(nextStart, 1)

              const data: { status: 'ACTIVE'; startDate?: Date; endDate?: Date } = { status: 'ACTIVE' }
              if(!subscription.startDate) data.startDate = nextStart
              if(!subscription.endDate) data.endDate = nextEnd

              const updated = await tx.subscription.updateMany({
                where: {
                  id: payment.subscriptionId,
                  status: { not: 'CANCELLED' },
                  OR: [
                    { status: { not: 'ACTIVE' } },
                    { startDate: null },
                    { endDate: null },
                  ]
                },
                data
              })

              if(updated.count > 0) {
                console.log(`Inscrição ${payment.subscriptionId} paga. Atualizada com sucesso.`)
              }
            }
          }

          return { received: true }
        })
  }
}
