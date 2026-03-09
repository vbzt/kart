import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import type{ JwtUserPayload } from 'src/common/types/jwt-payload';
import { UserService } from './user.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserMeController {
  constructor(private readonly userService: UserService) {}

  @Get('/me')
  async me(@CurrentUser() user: JwtUserPayload) {
    return this.userService.readMe(user.userId);
  }
}

