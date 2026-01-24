import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { supabase } from 'src/common/config/supabase.config';
import { LoginDTO } from './dto/login.dto';
import { UserService } from '../user/user.service';
import { SignUpDTO } from './dto/sign-up.dto';
import { handleSupabaseError } from 'src/common/exceptions/supabase-error.handler';
import { ResetPasswordRequestDTO } from './dto/reset-password-request.dto';
import { ResetPasswordDTO } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
   constructor(private readonly userService: UserService) {}

    async signUp( signUpData: SignUpDTO ){ 
      if(signUpData.password !== signUpData.confirmPassword) throw new BadRequestException("As senhas não coincidem.")

      const { data, error } = await supabase.auth.signUp( { email: signUpData.email, password: signUpData.password } )

      if(error) handleSupabaseError(error)
      if(!data.user?.email) throw new BadRequestException('Falha ao criar usuário. Tente novamente mais tarde.')
      
      const userData = await this.userService.create( { email: data.user.email, id: data.user.id, name: signUpData.name, cpf: signUpData.cpf, phone: signUpData.phone })

      return { 
        message: "Usuário criado com sucesso.",
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
      },
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token
      }
    }

    async signIn ( signInData: LoginDTO ){ 
      const { data, error } = await supabase.auth.signInWithPassword({ email: signInData.email, password: signInData.password })
      if (error) {
        handleSupabaseError(error)
      }
      
      if(!data.user?.id) throw new InternalServerErrorException('Erro ao autenticar usuário. Tente novamente mais tarde.')
      const userData = await this.userService.readOne(data.user.id)
      return {
        message: "Login realizado com sucesso.",
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
      },
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token
      }
    }

    async signOut(){ 
      const { error } = await supabase.auth.signOut()
      if(error) {
        handleSupabaseError(error)
      }

      return { message: 'Sessão encerrada com sucesso.'}
      
    } 

    async refreshSession( refresh_token: string ){ 
      const { data, error } = await supabase.auth.refreshSession( { refresh_token } )
      if(error) {
        handleSupabaseError(error)
      }

      if(!data.session) throw new InternalServerErrorException('Falha ao renovar sessão.')
      
      const { session, user } = data
      return { 
        access_token: session!.access_token,
        refresh_token: session!.refresh_token
      }
      
    }

    async sendPasswordResetRequest( { email }: ResetPasswordRequestDTO ){ 
      await supabase.auth.resetPasswordForEmail( email, { redirectTo: 'http://127.0.0.1:3001/auth/reset-password'})
      return { message: 'Email de recuperação de senha enviado. Cheque sua caixa de entrada para instruções.'}
    }

    async resetPassword( { password, confirmPassword }: ResetPasswordDTO ){
      if(password !== confirmPassword) throw new BadRequestException("As senhas não coincidem.")

      const { error, data } = await supabase.auth.updateUser( { password } )
      if(error) handleSupabaseError(error)
      return { message: 'Senha alterada com sucesso.'}
      
    }

}
