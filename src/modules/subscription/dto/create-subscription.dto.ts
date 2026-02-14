import { SubscriptionStatus } from "@prisma/client";
import { IsDateString, IsEnum, IsString, IsUUID } from "class-validator";

export class CreateSubscriptionDTO{ 
    @IsString()
    @IsUUID(4)
    planId: string 

}