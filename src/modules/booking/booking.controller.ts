import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateBookingDTO } from './dto/create-booking.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { BookingService } from './booking.service';
import type { JwtUserPayload } from 'src/common/types/jwt-payload';
import { SubscriptionGuard } from 'src/common/guards/subscription.guard';
import { CurrentSubscription } from 'src/common/decorators/current-subscription';
import type { Subscription, User } from '@prisma/client';
import { ParamId } from 'src/common/decorators/param-id.decorator';


@UseGuards(JwtAuthGuard)
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService){}

  @Get('/my-bookings')
  async readUserBookings(@CurrentUser() user: JwtUserPayload){ 
    return this.bookingService.readUserBookings(user)
  }

  @Get("/:id")
  async readOne(@ParamId() id: string){ 
    return this.bookingService.readOne(id)
  }

  @Post('')
  async create(@Body() data: CreateBookingDTO, @CurrentUser() user: JwtUserPayload ){ 
    return this.bookingService.create(data, user)
  }

  @UseGuards(SubscriptionGuard)
  @Post("/subscription")
  async createBookingWithSubscription(@CurrentUser() user: JwtUserPayload, @CurrentSubscription() subscription: Subscription, @Body() data: CreateBookingDTO  ){
    return this.bookingService.createBookingWithCredits(subscription, user, data)
  }


}
