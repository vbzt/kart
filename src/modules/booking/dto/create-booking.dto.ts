import { BookingStatus, ExperienceLevel, PaymentType } from "@prisma/client";
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

  @IsEnum(PaymentType)
  paymentType: PaymentType

}