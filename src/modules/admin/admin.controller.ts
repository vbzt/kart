import { Controller, Delete, Get, Patch, UseGuards } from '@nestjs/common';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { ParamId } from 'src/common/decorators/param-id.decorator';


@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService){}

  @Get()
  async readAdmins(){ 
    return this.adminService.readAdmins() 
  } 

  @Patch("/:id")
  async setAdminUser(@ParamId() userId: string){
    return this.adminService.setAdminUser(userId)
  }

  @Delete("/:id")
  async removeAdminUser(@ParamId() userId: string){ 
    return this.adminService.removeAdminUser(userId)
  }



}
