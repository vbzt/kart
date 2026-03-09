import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDTO } from './dto/create-coupon.dto';
import { EditCouponDTO } from './dto/edit-coupon.dto';
import { DiscountType } from '@prisma/client';

@Injectable()
export class CouponService {

  constructor(private readonly prismaService: PrismaService){}

  async create(data: CreateCouponDTO){
    const existingCoupon = await this.prismaService.coupon.findUnique( { where: { code: data.code} } )
    if(existingCoupon) throw new ConflictException("Este cupom já existe.")
    const coupon = await this.prismaService.coupon.create( { data } )
    return { message: "Cupom criado com sucesso.", coupon } 
  }

  async read(){
    return this.prismaService.coupon.findMany()
  }

  async readOne(code: string){ 
    const coupon = await this.prismaService.coupon.findUnique({ where: { code } })
    if(!coupon) throw new NotFoundException('Este cupom não existe.')
    return coupon
  }

  async update(data: EditCouponDTO, code: string){ 
    await this.readOne(code)
    if(data.code){
      const existingCoupon = await this.prismaService.coupon.findUnique( { where: { code: data.code} } )
      if(existingCoupon) throw new ConflictException("Este cupom já existe.")
    }
    const updatedCoupon = await this.prismaService.coupon.update({ where: { code }, data })
    return { message: "Cupom atualizado com sucesso.", updatedCoupon } 
  }

  async delete(code:string){
    await this.readOne(code)
    await this.prismaService.coupon.delete({ where: { code }})
  }


  async useCoupon(price: number, couponCode: string){ 
    const coupon = await this.readOne(couponCode)
    if(!coupon.isActive) throw new BadRequestException("Cupom inválido.")
    if(coupon.maxUses && coupon.currentUses >= coupon.maxUses) throw new BadRequestException("Cupom atingiu o limite de uso.")
    
    await this.prismaService.coupon.update({ where: { code: couponCode }, data: { currentUses: { increment: 1 } } } )
    if (coupon.discountType === DiscountType.FIXED) {
      return { finalPrice: Math.max(0, price - coupon.discountValue), discount: coupon.discountValue }
    }
    const discount = price * (coupon.discountValue / 100)
    return { finalPrice: Math.max(0, price - discount), discount}
  }
}
