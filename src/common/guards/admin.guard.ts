import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Observable } from 'rxjs';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class AdminGuard implements CanActivate { 
  constructor(private readonly userService: UserService){}

  async canActivate(context: ExecutionContext): Promise<boolean>{ 
    const req = context.switchToHttp().getRequest()
    const user = req.user 
    const { role } = await this.userService.readOne(user.id)
    if (role !== UserRole.ADMIN) return false 
    return true 

  }
}
