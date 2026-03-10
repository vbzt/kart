import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";

export const CurrentSubscription = createParamDecorator(
  (data: string, context: ExecutionContext) => { 
    const req = context.switchToHttp().getRequest()
    const subscription = req.subscription
    
    if(!subscription) {
      throw new UnauthorizedException("Usuário não possui inscrição.")
    }
    
    if(data) {
      return subscription[data]
    }
    
    return subscription
  }
)