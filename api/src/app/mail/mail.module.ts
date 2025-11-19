import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { AppConfig } from '../config/configuration';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => {
        const mail =
          configService.get('app.mail', { infer: true }) ??
          ({
            host: 'localhost',
            port: 1025,
            user: '',
            pass: '',
            from: 'no-reply@localhost',
          } satisfies AppConfig['mail']);
        return {
          transport: {
            host: mail.host,
            port: mail.port,
            secure: false,
            auth: mail.user
              ? {
                  user: mail.user,
                  pass: mail.pass,
                }
              : undefined,
          },
          defaults: {
            from: mail.from,
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}

