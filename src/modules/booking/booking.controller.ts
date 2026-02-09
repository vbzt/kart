import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateBookingDTO } from './dto/create-booking.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { BookingService } from './booking.service';


@UseGuards(JwtAuthGuard)
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService){}

  @Post('')
  async create( @Body() data: CreateBookingDTO, @CurrentUser() user: { userId: string, email: string } ){ 
    return this.bookingService.create(data, user.userId)
  }


}
