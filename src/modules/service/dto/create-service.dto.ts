import { PriceType } from "@prisma/client";
import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateServiceDTO{ 
  @IsString()
  title: string 

  @IsOptional()
  @IsString()
  description: string

  @IsInt()
  @Min(1)
  priceCents: number

  @IsOptional()
  @IsInt()
  @Min(1)
  promotionalPriceCents: number

  @IsOptional()
  @IsBoolean()
  isPromotional: boolean

  @IsNumber()
  @Min(10)
  durationMinutes: number

  @IsInt()
  @Min(1)
  @Max(10)
  maxCapacity: number

  @IsEnum(PriceType)
  priceType: PriceType

  @IsOptional()
  @IsBoolean()
  isActive: boolean 
}