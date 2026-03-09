import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UserMeController } from './user.me.controller';

@Module({
  imports: [PrismaModule],
  providers: [UserService],
  controllers: [UserController, UserMeController],
  exports: [UserService]
})
export class UserModule {}
 