import { Min, IsInt } from 'class-validator';


export class CreatePixDTO {
  @IsInt()
  @Min(1)
  amount: number;

}
