import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";

export const CurrentSubscription = createParamDecorator((_args: unknown, context: ExecutionContext) => { 
    const req = context.switchToHttp().getRequest()
    const subscription = req.subscription
    if(!subscription) throw new UnauthorizedException("Usuário não possui inscrição.")
    return subscription
})