import { Body, Controller, Post, Query, UnauthorizedException } from '@nestjs/common';

@Controller('webhook/abacatepay')
export class WebhookController {
  private abacateKey

  constructor() {
    const abacateKey = process.env.ABACATE_WEBHOOK_SECRET;

    if (!abacateKey) {
      throw new Error('Chave da API AbacatePay não definida.')
    }
    this.abacateKey = abacateKey
  }

  @Post() 
  async webhook(@Query('webhookSecret') webhookSecret: string, @Body() payload: any){
    if(webhookSecret !== this.abacateKey) throw new UnauthorizedException("Invalid webhook secret.")
      console.log(payload)
    return payload
  }
}
