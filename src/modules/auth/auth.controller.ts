import { Request } from 'express';
import {
  Controller,
  Body,
  Post,
  Get,
  HttpStatus,
  HttpCode,
  Req,
  Query,
} from '@nestjs/common';

import { Public, AllRoles } from '@common/decorators';
import { USER_LOGOUT_SUCCESS } from '@common/constants';

import { LoginDto, RecoverPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { ActivateDto } from './dto/activate.dto';

import { AuthService } from './auth.service';
import { ResponseAuth, UserPlatform } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<ResponseAuth> {
    return await this.authService.login(loginDto);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(): { message: string } {
    return { message: USER_LOGOUT_SUCCESS };
  }

  @Get('me')
  @AllRoles()
  profile(@Req() request: Request): UserPlatform {
    return request.user as UserPlatform;
  }

  @Public()
  @Post('activate-account')
  @HttpCode(HttpStatus.OK)
  async activateAccount(
    @Body() activateDto: ActivateDto,
  ): Promise<{ active: boolean }> {
    return await this.authService.activateAccount(activateDto);
  }

  @Public()
  @Get('activate-account')
  async requestActivateAccount(
    @Query('email') email: string,
  ): Promise<{ send: boolean }> {
    return await this.authService.requestActivateAccount(email);
  }

  @Public()
  @Post('recover-password')
  @HttpCode(HttpStatus.OK)
  async recoverPassword(
    @Body() recoverPasswordDto: RecoverPasswordDto,
  ): Promise<{ send: boolean }> {
    await this.authService.recoverPassword(recoverPasswordDto);

    return { send: true };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ changed: boolean }> {
    return await this.authService.resetPassword(resetPasswordDto);
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Query('tkn') token: string): Promise<{ token: string }> {
    return await this.authService.refreshToken(token);
  }
}
