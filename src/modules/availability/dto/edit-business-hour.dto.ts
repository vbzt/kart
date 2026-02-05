import { PartialType } from "@nestjs/mapped-types";
import { CreateBusinessHourDTO } from "./create-business-hour.dto";

export class EditBusinessHourDTO extends PartialType(CreateBusinessHourDTO){ 

}