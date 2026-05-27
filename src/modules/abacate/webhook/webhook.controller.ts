import {
  BadRequestException,
  Controller,
  Headers,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request } from 'express';
import { WebhookService } from './webhook.service';

@Controller('webhook/abacatepay')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @SkipThrottle()
  @Post()
  async webhook(
    @Query('webhookSecret') webhookSecret: string,
    @Req() req: Request,
    @Headers('x-webhook-signature') signature: string,
  ) {
    if (!this.webhookService.verifyWebhookSecret(webhookSecret)) {
      throw new UnauthorizedException('Webhook secret invalido.');
    }

    const rawBody = (req as any).rawBody?.toString();
    if (!rawBody) throw new BadRequestException('Raw body nao encontrado.');

    if (!this.webhookService.verifyAbacateSignature(rawBody, signature)) {
      throw new UnauthorizedException('Assinatura do webhook invalida.');
    }

    const payload = JSON.parse(rawBody);

    if (payload.event === 'transparent.completed') {
      return this.webhookService.updatePayment(payload);
    }

    return { received: true };
  }
}
