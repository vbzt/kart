import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsInt, IsOptional, Max, Min } from "class-validator";

export class CreateBusinessHourDTO{ 


  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number

  @IsOptional()
  @IsBoolean()
  isOpen: boolean


  @IsDate()
  @Type(() => Date)
  openTime: Date

  @IsDate()
  @Type(() => Date)
  closeTime: Date

   

}