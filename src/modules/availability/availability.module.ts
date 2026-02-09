import { Module } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ServiceModule } from '../service/service.module';

@Module({
  imports: [PrismaModule, ServiceModule],
  providers: [AvailabilityService],
  controllers: [AvailabilityController],
  exports: [AvailabilityService]
})
export class AvailabilityModule {}
