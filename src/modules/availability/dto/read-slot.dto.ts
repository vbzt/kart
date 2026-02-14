import { Type } from "class-transformer";
import { IsDate, IsDateString, IsInt, IsString, IsUUID, Max, Min } from "class-validator";

export class ReadSlotDTO{ 

  @IsString()
  @IsUUID(4)
  serviceId: string

  @IsDateString()
  bookingDate: string

  @IsDate()
  @Type(() => Date)
  bookingTime: Date

  @IsInt()
  @Min(1)
  numberOfPeople: number

}