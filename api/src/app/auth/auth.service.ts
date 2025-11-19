import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession } from './entities/user-session.entity';
import { EmailToken, EmailTokenType } from './entities/email-token.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/configuration';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { MailService } from '../mail/mail.service';
import { User } from '../users/entities/user.entity';
import { randomBytes, createHash } from 'crypto';
import { compare, hash } from 'bcryptjs';
import { Response } from 'express';
import { IsNull } from 'typeorm';

const REFRESH_COOKIE = 'refreshToken';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(UserSession)
    private readonly sessionsRepository: Repository<UserSession>,
    @InjectRepository(EmailToken)
    private readonly emailTokenRepository: Repository<EmailToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig, true>,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email.toLowerCase());
    if (existing) {
      throw new BadRequestException('Пользователь уже существует');
    }

    const passwordHash = await hash(dto.password, 12);
    const user = await this.usersService.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    const link = await this.createEmailToken(user, 'verify');
    return this.buildDevResponse(
      'Регистрация успешна, проверьте почту для подтверждения',
      link,
    );
  }

  async login(dto: LoginDto, metadata?: { userAgent?: string; ip?: string }) {
    const user = await this.usersService.findByEmail(dto.email.toLowerCase());
    const invalidMessage = 'Неверная почта или пароль';
    if (!user) {
      throw new UnauthorizedException(invalidMessage);
    }

    const passwordValid = await compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException(invalidMessage);
    }

    if (!user.emailVerified) {
      const verifyLink = await this.createEmailToken(user, 'verify');
      throw new UnauthorizedException({
        message: 'Подтвердите email перед входом',
        devLink: this.isDev() ? verifyLink : undefined,
      });
    }

    return this.issueSession(user, metadata);
  }

  async refresh(user: User, sessionId: string, token: string) {
    const session = await this.sessionsRepository.findOne({
      where: { id: sessionId },
      relations: ['user'],
    });

    if (!session || session.user.id !== user.id) {
      throw new UnauthorizedException('Сессия не найдена');
    }

    if (session.expiresAt.getTime() < Date.now()) {
      await this.sessionsRepository.delete(session.id);
      throw new UnauthorizedException('Сессия истекла');
    }

    const tokenHash = this.hashToken(token);
    if (session.refreshTokenHash !== tokenHash) {
      await this.sessionsRepository.delete(session.id);
      throw new UnauthorizedException('Сессия недействительна');
    }

    await this.sessionsRepository.delete(session.id);
    return this.issueSession(user, {
      userAgent: session.userAgent ?? undefined,
      ip: session.ipAddress ?? undefined,
    });
  }

  async logout(sessionId: string) {
    if (!sessionId) {
      return;
    }
    await this.sessionsRepository.delete(sessionId);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email.toLowerCase());
    if (!user) {
      return { message: 'Если email существует, письмо отправлено' };
    }

    const link = await this.createEmailToken(user, 'reset');
    return this.buildDevResponse('Письмо для сброса пароля отправлено', link);
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenRecord = await this.consumeEmailToken(
      dto.email.toLowerCase(),
      dto.token,
      'reset',
    );

    if (!tokenRecord) {
      throw new BadRequestException('Неверный или истекший токен');
    }

    const passwordHash = await hash(dto.password, 12);
    await this.usersService.updatePassword(tokenRecord.user.id, passwordHash);
    await this.invalidateAllSessions(tokenRecord.user.id);
    return { message: 'Пароль обновлён' };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const tokenRecord = await this.consumeEmailToken(
      dto.email.toLowerCase(),
      dto.token,
      'verify',
    );

    if (!tokenRecord) {
      throw new BadRequestException('Неверный или истекший токен');
    }

    await this.usersService.markEmailVerified(tokenRecord.user.id);
    return { message: 'Email подтверждён' };
  }

  async resendVerification(email: string) {
    const user = await this.usersService.findByEmail(email.toLowerCase());
    if (!user) {
      return { message: 'Если email существует, письмо отправлено' };
    }
    if (user.emailVerified) {
      return { message: 'Email уже подтверждён' };
    }

    const link = await this.createEmailToken(user, 'verify');
    return this.buildDevResponse('Письмо отправлено повторно', link);
  }

  private async issueSession(
    user: User,
    metadata?: { userAgent?: string; ip?: string },
  ) {
    const jwtConfig = this.getJwtConfig();
    const expiresAt = this.addDuration(jwtConfig.refreshTtl);
    const session = await this.sessionsRepository.save(
      this.sessionsRepository.create({
        user,
        userAgent: metadata?.userAgent,
        ipAddress: metadata?.ip,
        expiresAt,
        refreshTokenHash: '',
      }),
    );

    const tokens = await this.generateTokens(user, session.id);
    await this.sessionsRepository.update(session.id, {
      refreshTokenHash: this.hashToken(tokens.refreshToken),
      expiresAt,
    });

    return {
      tokens,
      user: this.toSafeUser(user),
      sessionId: session.id,
    };
  }

  private async createEmailToken(user: User, type: EmailTokenType) {
    const ttl =
      type === 'verify'
        ? ((this.configService.get as any)('app.emailTokenTtlMinutes') as
            | number
            | undefined) ?? 60
        : ((this.configService.get as any)('app.resetTokenTtlMinutes') as
            | number
            | undefined) ?? 30;
    const token = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + ttl * 60 * 1000);

    await this.emailTokenRepository.save(
      this.emailTokenRepository.create({
        user,
        type,
        tokenHash,
        expiresAt,
      }),
    );

    const path =
      type === 'verify'
        ? '/auth/verify'
        : '/auth/reset-password';
    const link = this.buildActionLink(path, token, user.email);

    if (type === 'verify') {
      await this.mailService.sendEmailVerification(user.email, link);
    } else {
      await this.mailService.sendPasswordReset(user.email, link);
    }

    if (this.isDev()) {
      this.logger.log(`DEV ${type} link for ${user.email}: ${link}`);
    }

    return link;
  }

  private async consumeEmailToken(
    email: string,
    token: string,
    type: EmailTokenType,
  ) {
    const tokenHash = this.hashToken(token);
    const record = await this.emailTokenRepository.findOne({
      where: {
        tokenHash,
        type,
        user: { email },
        usedAt: IsNull(),
      },
      relations: ['user'],
    });

    if (!record) {
      return null;
    }

    if (record.expiresAt.getTime() < Date.now()) {
      await this.emailTokenRepository.delete(record.id);
      return null;
    }

    record.usedAt = new Date();
    await this.emailTokenRepository.save(record);
    return record;
  }

  private async invalidateAllSessions(userId: string) {
    await this.sessionsRepository.delete({ user: { id: userId } });
  }

  toSafeUser(user: User) {
    const { id, email, firstName, lastName, role, emailVerified } = user;
    return { id, email, firstName, lastName, role, emailVerified };
  }

  private async generateTokens(user: User, sessionId: string) {
    const payload = { sub: user.id, sid: sessionId, role: user.role };
    const jwtConfig = this.getJwtConfig();

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtConfig.accessSecret,
        expiresIn: jwtConfig.accessTtl,
      } as any),
      this.jwtService.signAsync(payload, {
        secret: jwtConfig.refreshSecret,
        expiresIn: jwtConfig.refreshTtl,
      } as any),
    ]);

    return { accessToken, refreshToken };
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private addDuration(duration: string) {
    const unit = duration.slice(-1);
    const value = parseInt(duration.slice(0, -1), 10);
    const msMap: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return new Date(Date.now() + value * (msMap[unit] ?? 0));
  }

  buildActionLink(path: string, token: string, email: string) {
    const appUrl =
      ((this.configService.get as any)('app.appUrl') as string | undefined) ??
      'http://localhost:4200';
    const url = new URL(path, appUrl);
    url.searchParams.append('token', token);
    url.searchParams.append('email', email);
    return url.toString();
  }

  setAuthCookies(res: Response, refreshToken: string) {
    const jwtConfig = this.getJwtConfig();
    const nodeEnv =
      ((this.configService.get as any)('app.nodeEnv') as string | undefined) ??
      'development';
    res.cookie(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: nodeEnv === 'production',
      maxAge: this.parseDuration(jwtConfig.refreshTtl),
      path: '/api/auth',
    });
  }

  clearAuthCookies(res: Response) {
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  }

  private parseDuration(duration: string) {
    const unit = duration.slice(-1);
    const value = parseInt(duration.slice(0, -1), 10);
    const msMap: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return value * (msMap[unit] ?? 0);
  }

  private getJwtConfig(): AppConfig['jwt'] {
    const jwt = (this.configService.get as any)('app.jwt') as
      | AppConfig['jwt']
      | undefined;
    if (!jwt) {
      throw new Error('JWT configuration missing');
    }
    return jwt;
  }

  private isDev() {
    const nodeEnv =
      ((this.configService.get as any)('app.nodeEnv') as string | undefined) ??
      'development';
    return nodeEnv !== 'production';
  }

  private buildDevResponse(message: string, link?: string) {
    if (!this.isDev() || !link) {
      return { message };
    }
    return { message, devLink: link };
  }
}

