import { PartialType } from "@nestjs/mapped-types"
import { CreateBlockedPeriodDTO } from "./create-blocked-period.dto"

export class EditBlockPeriodDTO extends PartialType(CreateBlockedPeriodDTO){}