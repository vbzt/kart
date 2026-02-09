import { BookingStatus, ExperienceLevel } from "@prisma/client";
import { Type } from "class-transformer";
import { IsDate, IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class CreateBookingDTO{
  @IsString()
  @IsUUID(4)
  serviceId: string
  
  @IsDateString()
  bookingDate: string

  @IsDate()
  @Type(() => Date)
  bookingTime: Date

  @IsOptional()
  @IsInt()
  @Min(1)
  numberOfPeople: number

  @IsEnum(BookingStatus)
  status: BookingStatus

  @IsOptional()
  @IsInt()
  @Min(1)
  originalPriceCents: number

  @IsOptional()
  @IsInt()
  @Min(0)
  discountCents: number

  @IsOptional()
  @IsInt()
  @Min(1)
  finalPriceCents: number

  @IsOptional()
  @IsString()
  couponCode: string

  @IsOptional()
  @IsString()
  howDidYouKnow: string

  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel: ExperienceLevel

  @IsOptional()
  @IsString()
  notes: string  

}