import { IsEmail, IsString, IsStrongPassword } from "class-validator";

export class CreateUserDTO{ 
  @IsString()
  id: string

  @IsString()
  name: string

  @IsEmail()
  email: string

  @IsString()
  cpf: string

  @IsString()
  phone: string 
  

}