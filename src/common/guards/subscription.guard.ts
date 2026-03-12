import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { SubscriptionService } from 'src/modules/subscription/subscription.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const { subscription, hasActiveSubscription } =
      await this.subscriptionService.readActiveSubscription(user.userId);

    if (!hasActiveSubscription) {
      return false;
    }

    req.subscription = subscription;
    return true;
  }
}