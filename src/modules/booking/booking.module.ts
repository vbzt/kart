import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AbacateModule } from '../abacate/abacate.module';
import { UserModule } from '../user/user.module';
import { CouponModule } from '../coupon/coupon.module';
import { ServiceModule } from '../service/service.module';
import { AvailabilityModule } from '../availability/availability.module';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [PrismaModule, AbacateModule, UserModule, CouponModule, ServiceModule, AvailabilityModule, SubscriptionModule], 
  providers: [BookingService],
  controllers: [BookingController]
})
export class BookingModule {}
