import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PlansModule } from '../plans/plans.module';
import { AbacateModule } from '../abacate/abacate.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PrismaModule, AbacateModule, PlansModule, UserModule],
  providers: [SubscriptionService],
  controllers: [SubscriptionController],
  exports: [SubscriptionService]
})
export class SubscriptionModule {}
