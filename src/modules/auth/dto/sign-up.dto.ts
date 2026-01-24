
import { IsString, IsStrongPassword } from "class-validator"
import { LoginDTO } from "./login.dto"

export class SignUpDTO extends LoginDTO{ 
    @IsString()
    name: string

    @IsString()
    cpf: string

    @IsString()
    phone: string

    @IsStrongPassword({minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1} ) 
    confirmPassword: string
}