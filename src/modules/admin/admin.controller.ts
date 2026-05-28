import { BadRequestException, Controller, Delete, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { BookingStatus, PaymentStatus } from '@prisma/client';
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

  @Get('/dashboard/metrics')
  async readDashboardMetrics() {
    return this.adminService.readDashboardMetrics()
  }

  @Get('/bookings')
  async readBookings(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('status') status?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.readBookings({
      dateFrom,
      dateTo,
      status: this.parseBookingStatus(status),
      paymentStatus: this.parsePaymentStatus(paymentStatus),
      search,
    })
  }

  @Patch("/:id")
  async setAdminUser(@ParamId() userId: string){
    return this.adminService.setAdminUser(userId)
  }

  @Delete("/:id")
  async removeAdminUser(@ParamId() userId: string){ 
    return this.adminService.removeAdminUser(userId)
  }

  private parseBookingStatus(status?: string) {
    if (!status) return undefined;
    if (!Object.values(BookingStatus).includes(status as BookingStatus)) {
      throw new BadRequestException('Status de reserva invalido.')
    }
    return status as BookingStatus;
  }

  private parsePaymentStatus(status?: string) {
    if (!status) return undefined;
    if (!Object.values(PaymentStatus).includes(status as PaymentStatus)) {
      throw new BadRequestException('Status de pagamento invalido.')
    }
    return status as PaymentStatus;
  }

}
