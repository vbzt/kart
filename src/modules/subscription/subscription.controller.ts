import { Body, Controller, Get, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { CreateSubscriptionDTO } from './dto/create-subscription.dto';
import { SubscriptionService } from './subscription.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtUserPayload } from 'src/common/types/jwt-payload';
import { SubscriptionStatus } from '@prisma/client';
import { ParamId } from 'src/common/decorators/param-id.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService){}

  
  @Post('')
  async create(@Body() data: CreateSubscriptionDTO, @CurrentUser() user: JwtUserPayload){ 
      return this.subscriptionService.create(data, user.userId)
  }

  @Get('/active')
  async readActiveSubscription(@CurrentUser() user: JwtUserPayload){ 
    return this.subscriptionService.readActiveSubscription(user.userId)
  }

  @Get('/history')
  async readSubscriptionHistory(@CurrentUser() user: JwtUserPayload){ 
    return this.subscriptionService.readSubscriptionHistory(user.userId)
  }

  @Get('/:id/payment-status')
  async readPaymentStatus(@CurrentUser() user: JwtUserPayload, @ParamId(new ParseUUIDPipe({ version: '4' })) id: string){ 
    return this.subscriptionService.readPaymentStatus(user.userId, id)
  }


}
