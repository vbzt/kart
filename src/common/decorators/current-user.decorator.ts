import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtUserPayload } from '../types/jwt-payload';

export const CurrentUser = createParamDecorator(
  (field: keyof JwtUserPayload | undefined, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    const userData = req.user as JwtUserPayload | undefined;
    if (!userData) throw new UnauthorizedException('Usuário não autenticado.');
    return field ? userData[field] : userData;
  },
);