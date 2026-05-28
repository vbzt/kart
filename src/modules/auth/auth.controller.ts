import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CpfPipe } from 'src/common/pipes/cpf.pipe';
import { Phonepipe } from 'src/common/pipes/phone.pipe';
import type { JwtUserPayload } from 'src/common/types/jwt-payload';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { ResetPasswordRequestDTO } from './dto/reset-password-request.dto';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import { SignUpDTO } from './dto/sign-up.dto';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Throttle({ default: { limit: 5, ttl: 60 } })
  @Post('/register')
  async signUp(
    @Body(CpfPipe, Phonepipe) signUpData: SignUpDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    const data = await this.authService.signUp(signUpData);
    this.setRefreshCookie(response, data.refresh_token);
    const { refresh_token, ...cleanData } = data;
    return cleanData;
  }

  @Throttle({ default: { limit: 5, ttl: 60 } })
  @Post('/login')
  async signIn(
    @Body() signInData: LoginDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    const data = await this.authService.signIn(signInData);
    this.setRefreshCookie(response, data.refresh_token);
    const { refresh_token, ...cleanData } = data;
    return cleanData;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  async signOut(@Res({ passthrough: true }) response: Response) {
    const data = await this.authService.signOut();
    this.clearRefreshCookie(response);
    return data.message; 
  }

  @Throttle({ default: { limit: 5, ttl: 60 } })
  @Post('/refresh')
  async refreshSession(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const refreshToken = request.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token não encontrado.');
    }

    const data = await this.authService.refreshSession(refreshToken);
    this.setRefreshCookie(response, data.refresh_token);
    const { refresh_token, ...cleanData } = data;
    return cleanData;
  }

  @Post('/recover-password-request')
  async sendPasswordResetRequest(@Body() data: ResetPasswordRequestDTO) {
    return this.authService.sendPasswordResetRequest(data);
  }

  @Patch('reset-password')
  async resetPassword(@Body() data: ResetPasswordDTO) {
    return this.authService.resetPassword(data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async me(@CurrentUser() user: JwtUserPayload) {
    const profile = await this.userService.readMe(user.userId);

    return {
      userId: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
    };
  }

  private setRefreshCookie(response: Response, refreshToken?: string) {
    if (!refreshToken) return;

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 3600000,
    });
  }

  private clearRefreshCookie(response: Response) {
    response.clearCookie('refresh_token', {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
  }
}
