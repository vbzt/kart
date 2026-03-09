import { Body, Controller, Post, Query, UnauthorizedException } from '@nestjs/common';
import { WebhookService } from './webhook.service';

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

  @Post() 
  async webhook(@Query('webhookSecret') webhookSecret: string, @Body() payload: any){
    if(webhookSecret !== this.abacateKey) throw new UnauthorizedException("Invalid webhook secret.")
    if(payload.event === 'billing.paid'){ 
      return await this.webhookService.updatePayment(payload)
    }
    return { received: true }
  }
}
