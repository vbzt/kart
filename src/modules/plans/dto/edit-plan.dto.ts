import { PartialType } from "@nestjs/mapped-types"
import { CreatePlanDTO } from "./create-plan.dto"

export class EditPlanDTO extends PartialType(CreatePlanDTO){ 

}