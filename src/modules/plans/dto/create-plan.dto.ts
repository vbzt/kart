import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, IsUUID, Min, MinLength } from "class-validator"

export class CreatePlanDTO{ 
  
  @IsString()
  name: string 

  @IsOptional()
  @IsString()
  description: string 

  @IsInt()
  @Min(2)
  creditsPerMonth: number

  @IsInt()
  @Min(1)
  priceCents: number

  
  @IsOptional()
  @IsBoolean()
  isActive: boolean 

  @IsArray()
  @MinLength(1)
  @IsUUID('4', { each: true })
  servicesIds: string[]

}