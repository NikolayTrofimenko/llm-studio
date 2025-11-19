import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { UserSession } from './entities/user-session.entity';
import { EmailToken } from './entities/email-token.entity';
import { JwtModule } from '@nestjs/jwt';
import { AccessJwtStrategy } from './strategies/access-jwt.strategy';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSession, EmailToken]),
    UsersModule,
    JwtModule.register({}),
    MailModule,
  ],
  providers: [AuthService, AccessJwtStrategy, RefreshJwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

