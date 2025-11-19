import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/configuration';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AccessJwtStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(private readonly configService: ConfigService<AppConfig, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get('app.jwt', { infer: true })?.accessSecret ??
        'access-secret',
    });
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}

