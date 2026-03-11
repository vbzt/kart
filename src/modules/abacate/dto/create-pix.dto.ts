import { Min, IsInt } from 'class-validator';


export class CreatePixDTO {
  @IsInt()
  @Min(0)
  amount: number;

}