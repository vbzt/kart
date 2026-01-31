import { DiscountType } from "@prisma/client";
import { IsBoolean, IsDate, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Transform, Type }  from "class-transformer";

export class CreateCouponDTO{ 
  
  @IsString()
  @Transform(({value}) =>  value.toUpperCase())
  code: string

  @IsEnum(DiscountType)
  discountType: DiscountType

  @IsInt()
  @Min(1)
  discountValue: number

  @IsOptional()
  @IsBoolean()
  isActive: boolean

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  validFrom: Date

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  validUntil: Date

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses: number
}