import { Body, Controller, Headers, Post, Query, Req, UnauthorizedException } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import type { Request } from 'express';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('webhook/abacatepay')
export class WebhookController {
  private abacateKey

  constructor(private readonly webhookService: WebhookService) {
    const abacateKey = process.env.ABACATE_WEBHOOK_SECRET;

    if (!abacateKey) {
      throw new Error('Chave da API AbacatePay não definida.')
    }
    this.abacateKey = abacateKey
  }

  @SkipThrottle()
  @Post() 
  async webhook(@Query('webhookSecret') webhookSecret: string, @Req() req: Request, @Headers('x-webhook-signature') signature: string,){
    if(webhookSecret !== this.abacateKey) throw new UnauthorizedException()
    const rawBody = (req as any).rawBody.toString()
    // if(!this.webhookService.verifyAbacateSignature(rawBody, signature)) throw new UnauthorizedException()
     const payload = JSON.parse(rawBody)
    if(payload.event === 'billing.paid'){ 

      console.log('billing.paid')
      return await this.webhookService.updatePayment(payload, rawBody)
    }
    return { received: true }
  }
}
