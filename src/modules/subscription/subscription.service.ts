import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDTO } from './dto/create-subscription.dto';
import { PlansService } from '../plans/plans.service';
import { AbacateService } from '../abacate/abacate.service';
import { UserService } from '../user/user.service';
import { Service, Subscription, SubscriptionStatus } from '@prisma/client';
import { differenceInDays } from 'date-fns';

@Injectable()
export class SubscriptionService {
  constructor( 
    private readonly prismaService: PrismaService, 
    private readonly planService: PlansService,
    private readonly abacateService: AbacateService,
    private readonly userService: UserService
  ){}

  async create({ planId }: CreateSubscriptionDTO, userId: string){ 
      const plan = await this.planService.readOne(planId)
      const user = await this.userService.readOne(userId)
      const activeSubscription = await this.prismaService.subscription.findFirst( { where: { userId, status: 'ACTIVE' } } )
      if(activeSubscription) throw new BadRequestException("Este usuário já tem um plano mensal ativo.")
      
      const result = await this.prismaService.$transaction(async (tx) => { 
        const abacatePayment = await this.abacateService.createPayment({ 
        price: plan.priceCents, 
        customer:{ 
          cellphone: user.phone,
          email: user.email,
          name: user.name,
          taxId: user.cpf
        }})

        const subscription = await tx.subscription.create({ data: { creditsTotal: plan.creditsPerMonth, userId, planId } })

        const payment = await tx.payment.create({ 
          data: { 
            amountCents: plan.priceCents, 
            subscriptionId: subscription.id, 
            paymentType: 'DEPOSIT', 
            provider: "abacatepay", 
            providerPaymentId: abacatePayment.data.id,
            qrCodeUrl: abacatePayment.data.brCodeBase64, 
            paymentUrl: abacatePayment.data.brCode,
            createdBy: user.id
          }
        })

        return { subscription, payment, abacatePayment }

      })

      return { message: "Plano adquirido. Aguardando confirmação de pagamento", payment: result.abacatePayment}
      
      

  }

  async renew(subscriptionId: string, userId: string){ 
    const user = await this.userService.readOne(userId)
    const subscription = await this.readOne(subscriptionId, userId)
    if(!subscription) throw new BadRequestException()
    const result = await this.prismaService.$transaction(async (tx) => { 
      const abacatePayment = await this.abacateService.createPayment({ 
      price: subscription.plan.priceCents, 
      customer:{ 
        cellphone: user.phone,
        email: user.email,
        name: user.name,
        taxId: user.cpf
      }})

      

      const payment = await tx.payment.create({ 
        data: { 
          amountCents: subscription.plan.priceCents, 
          subscriptionId: subscription.id, 
          paymentType: 'DEPOSIT', 
          provider: "abacatepay", 
          providerPaymentId: abacatePayment.data.id,
          qrCodeUrl: abacatePayment.data.brCodeBase64, 
          paymentUrl: abacatePayment.data.brCode,
          createdBy: user.id
        }
      })

      return { subscription, payment, abacatePayment }

    })
    return { message: "Plano renovado com sucesso. Aguardando confirmação de pagamento", payment: result.abacatePayment }

  }

  async read(){ 
    return this.prismaService.subscription.findMany()
  }

  async readOne(id: string, userId: string){ 
    const subscription = await this.prismaService.subscription.findFirst({ where: { id, userId }, include: { plan: true, payments: { select: { paidAt: true } } } })
    if(!subscription) throw new NotFoundException("Esta assinatura não existe.")
    return subscription
  }

  async readActiveSubscription(userId: string){ 
    const subscription = await  this.prismaService.subscription.findFirst( { where: { userId, status: "ACTIVE" }, include: { plan: true, payments: { select: { paidAt: true } } } } )
    if(!subscription) return { hasActiveSubscription: false }
    
    return { 
      hasActiveSubscription: true,
      subscription: {
        id: subscription.id,
        planName: subscription.plan.name,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        daysRemaining: subscription.endDate ? Math.max(0, differenceInDays(subscription.endDate, new Date())) : 0,
        bookingsUsed: subscription.plan.creditsPerMonth - subscription.creditsTotal,
        bookingsRemaining: subscription.creditsTotal,
      }
    }

  }

  async readSubscriptionHistory(userId: string){ 
    return this.prismaService.subscription.findMany( { where: { userId } } )
  }

  async readPaymentStatus(userId: string, subscriptionId: string){ 
    const payment = await this.prismaService.payment.findFirst({ where: { subscriptionId, createdBy: userId }, select: { status: true }})
    if(!payment) throw new NotFoundException("Este pagamento não existe.")
    return payment
  }
}
