import { IsString, IsNumber, IsEmail, IsNotEmpty, ValidateNested, Min, IsPhoneNumber, IsDefined, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class CustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  cellphone: string;

  @IsString()
  @IsNotEmpty()
  taxId: string;  
}

export class CreatePixDTO {
  @IsInt()
  @Min(0)
  price: number;
  
  @IsDefined()
  @ValidateNested()
  @Type(() => CustomerDto)
  customer: CustomerDto;
}