import { Body, Controller, Get, Patch, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { LoginDTO } from './dto/login.dto';
import { SignUpDTO } from './dto/sign-up.dto';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { ResetPasswordRequestDTO } from './dto/reset-password-request.dto';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtUserPayload } from 'src/common/types/jwt-payload';
import { CpfPipe } from 'src/common/pipes/cpf.pipe';
import { Phonepipe } from 'src/common/pipes/phone.pipe';

@Controller('auth')
export class AuthController {
  constructor( private readonly authService: AuthService){}

  @Post('/register')
  async signUp(@Body(CpfPipe, Phonepipe) signUpData: SignUpDTO, @Res({ passthrough: true }) response: Response){
    const data = await this.authService.signUp(signUpData)
    response.cookie('refresh_token', data.refresh_token, { 
      httpOnly: true, 
      sameSite: 'strict',
      secure: false, 
      maxAge:  7 * 24 * 3600000 
    })
    const { refresh_token, ...cleanData } = data
    return cleanData
  }
  
  @Post('/login')
  async signIn(@Body() signInData: LoginDTO, @Res({ passthrough: true }) response: Response){
    const data = await this.authService.signIn(signInData)
    response.cookie('refresh_token', data.refresh_token, { 
      httpOnly: true, 
      sameSite: 'strict',
      secure: false, 
      maxAge:  7 * 24 * 3600000 
    })
    const { refresh_token, ...cleanData } = data
    return cleanData
  }

  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  async signOut(@Res({ passthrough: true }) response: Response){ 
    const data = await this.authService.signOut()
    response.clearCookie('refresh_token')
    return data.message
  }

  @Post('/refresh')
  async refreshSession(@Res({passthrough: true}) response: Response, @Req() request: Request){
    const refreshToken = request.cookies['refresh_token']
    if(!refreshToken) throw new UnauthorizedException('Refresh token não encontrado.')
    const data = await this.authService.refreshSession(refreshToken)
    response.cookie('refresh_token', data.refresh_token, { 
      httpOnly: true, 
      sameSite: 'strict',
      secure: false, 
      maxAge:  7 * 24 * 3600000 
    })
    const { refresh_token, ...cleanData } = data
    return cleanData
  }

  @Post('/recover-password-request')
  async sendPasswordResetRequest(@Body() data: ResetPasswordRequestDTO){
    return this.authService.sendPasswordResetRequest(data)
  }

  @Patch('reset-password')
  async resetPassword(@Body() data: ResetPasswordDTO){
    return this.authService.resetPassword(data)
  }

  @UseGuards(JwtAuthGuard)
  @Get("/me")
  async me(@CurrentUser() user: JwtUserPayload){ 
    return user
  }

  }
  


