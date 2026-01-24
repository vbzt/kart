import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const CurrentUser = createParamDecorator(( args: string | undefined, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest()
  const userData = req.user
  if(!userData) throw new UnauthorizedException("Usuário não autenticado.")
  if(args) return userData[args]
  console.log(userData)
  return userData
}
)