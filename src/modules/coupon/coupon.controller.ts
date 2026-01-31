import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { ParseCouponPipe } from 'src/common/pipes/parse-coupon.pipe';
import { CreateCouponDTO } from './dto/create-coupon.dto';
import { EditCouponDTO } from './dto/edit-coupon.dto';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService){}

  @Get()
  async read(){ 
    return this.couponService.read()
  }

  @Get('/:code')
  async readOne(@Param(ParseCouponPipe)params: { code: string }  ){ 
    return this.couponService.readOne(params.code)
  }
  

  @Post()
  async create(@Body(ParseCouponPipe) data: CreateCouponDTO){
     return this.couponService.create(data)
  }

  @Patch('/:code')
  async update(@Param(ParseCouponPipe)params: { code: string }, @Body(ParseCouponPipe) data: EditCouponDTO){
    return this.couponService.update(data, params.code)
  }


  @Delete('/:code')
  async delete(@Param(ParseCouponPipe)params: { code: string }  ){ 
    return this.couponService.delete(params.code)
  }
}
