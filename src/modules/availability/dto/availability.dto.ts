// availability.dto.ts
import { IsDateString, IsString, IsUUID } from "class-validator";

export class AvailabilityDTO{ 
  @IsString()
  @IsUUID(4)
  serviceId: string
  
  @IsDateString()
  date: string
}