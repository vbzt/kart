import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CreateBusinessHourDTO } from './dto/create-business-hour.dto';
import { CreateBlockedPeriodDTO } from './dto/create-blocked-period.dto';
import { EditBusinessHourDTO } from './dto/edit-business-hour.dto';
import { ParamId } from 'src/common/decorators/param-id.decorator';
import { EditBlockPeriodDTO } from './dto/edit-blocked-period.dto';
import { AvailabilityDTO } from './dto/availability.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AdminGuard } from 'src/common/guards/admin.guard';

@UseGuards(JwtAuthGuard)
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService){}

  @Get()
  async read(@Query() data: AvailabilityDTO){ 
    return this.availabilityService.getAvailability(data)
  }

  @Get('/business-hours')
  async readBusinessHours(){ 
    return this.availabilityService.readBusinessHours()
  } 

  @UseGuards(AdminGuard)
  @Post('/business-hours')
  async createBusinessHour(@Body() data: CreateBusinessHourDTO){
    return this.availabilityService.createBusinessHour(data)
  }

  @UseGuards(AdminGuard)
  @Patch('/business-hours/:dayOfWeek')
  async editBusinessHour(@Body() data: EditBusinessHourDTO, @Param('dayOfWeek', ParseIntPipe) dayOfWeek: number){
    return this.availabilityService.updateBusinessHour(data, dayOfWeek)
  }

  
  @Get('/blocked-period')
  async readBlockedPeriods(){ 
    return this.availabilityService.readBlockedPeriods()
  }

  @UseGuards(AdminGuard)
  @Post('/blocked-period')
  async createBlockedPeriod(@Body() data: CreateBlockedPeriodDTO){
    return this.availabilityService.createBlockedPeriod(data)
  }

  @UseGuards(AdminGuard)
  @Patch('/blocked-period/:id')
  async editBlockedPeriod(@Body() data: EditBlockPeriodDTO, @ParamId() id: string){
    return this.availabilityService.updateBlockedPeriod(data, id)
  }

}
