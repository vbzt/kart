import { IsStrongPassword } from "class-validator";

export class ResetPasswordDTO{ 
      @IsStrongPassword({minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1} ) 
      password: string

      @IsStrongPassword({minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1} ) 
      confirmPassword: string
}