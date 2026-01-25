import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator"

export class CreatePlanDTO{ 
  
  @IsString()
  name: string 

  @IsOptional()
  @IsString()
  description: string 

  @IsInt()
  @Min(2)
  creditsPerMonth: number

  @IsNumber()
  @Min(1)
  price: number

  
  @IsOptional()
  @IsBoolean()
  isActive: boolean 
}