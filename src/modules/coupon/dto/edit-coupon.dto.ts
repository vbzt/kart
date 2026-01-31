import { PartialType } from "@nestjs/mapped-types";
import { CreateCouponDTO } from "./create-coupon.dto";

export class EditCouponDTO extends PartialType(CreateCouponDTO){}