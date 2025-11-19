import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { UsersService } from '../users/users.service';
import { ResendVerificationDto } from './dto/resend-verification.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto, {
      userAgent: req.get('user-agent') ?? undefined,
      ip: req.ip,
    });
    this.authService.setAuthCookies(res, result.tokens.refreshToken);
    return { accessToken: result.tokens.accessToken, user: result.user };
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(
    @CurrentUser() payload: { sub: string; sid: string; refreshToken: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    const result = await this.authService.refresh(
      user,
      payload.sid,
      payload.refreshToken,
    );
    this.authService.setAuthCookies(res, result.tokens.refreshToken);
    return { accessToken: result.tokens.accessToken, user: result.user };
  }

  @Post('logout')
  @UseGuards(JwtRefreshGuard)
  async logout(
    @CurrentUser() payload: { sid: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(payload.sid);
    this.authService.clearAuthCookies(res);
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAccessGuard)
  async me(@CurrentUser() payload: { sub: string }) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.authService.toSafeUser(user);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('resend-verification')
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto.email);
  }
}

