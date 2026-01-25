import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { EditUserDTO } from './dto/edit-user.dto';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('users')
export class UserController {
  constructor( private readonly userService: UserService){ }

  @Get('')
  async read(){ 
    return this.userService.read()
  }

  @Get('/:id')
  async readOne(@Param('id') id: string ){ 
    return this.userService.readOne(id)
  }

  @Patch('/:id')
  async update(@Param('id') id: string, @Body() data: EditUserDTO ){ 
    return this.userService.update(data, id)
  }

  @Delete('/:id')
  async delete(@Param('id') id: string){ 
    return this.userService.delete(id)
  }
}
