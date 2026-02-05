import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsOptional, IsString, Matches } from "class-validator";

export class CreateBlockedPeriodDTO{ 
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  description: string
  
  @IsDate()
  @Type(() => Date)
  startDate: Date

  @IsDate()
  @Type(() => Date)
  endDate: Date

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime deve estar no formato HH:mm.', })
  startTime: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'endTime deve estar no formato HH:mm.', })
  endTime: string;


  
  @IsOptional()
  @IsBoolean()
  isActive: boolean



}