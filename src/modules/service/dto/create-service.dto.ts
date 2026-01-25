import { PriceType } from "@prisma/client";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateServiceDTO{ 
  @IsString()
  title: string 

  @IsOptional()
  @IsString()
  description: string

  @IsNumber()
  @Min(1)
  price: number

  @IsOptional()
  @IsNumber()
  @Min(1)
  promotionalPrice: number

  @IsOptional()
  @IsBoolean()
  isPromotional: boolean

  @IsNumber()
  @Min(10)
  durationMinutes: number

  @IsNumber()
  @Min(1)
  @Max(10)
  maxCapacity: number

  @IsEnum(PriceType)
  priceType: PriceType

  @IsOptional()
  @IsBoolean()
  isActive: boolean 
}