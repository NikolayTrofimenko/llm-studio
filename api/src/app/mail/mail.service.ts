import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailer: MailerService) {}

  async sendEmailVerification(email: string, link: string) {
    await this.safeSend({
      to: email,
      subject: 'Подтверждение регистрации',
      html: this.buildEmailTemplate(
        'Подтвердите вашу почту',
        'Для завершения регистрации перейдите по кнопке ниже.',
        link,
        'Подтвердить почту',
      ),
    });
    this.logger.log(`Email verification link sent to ${email}`);
  }

  async sendPasswordReset(email: string, link: string) {
    await this.safeSend({
      to: email,
      subject: 'Восстановление пароля',
      html: this.buildEmailTemplate(
        'Сброс пароля',
        'Если вы запрашивали восстановление пароля, нажмите на кнопку ниже.',
        link,
        'Сбросить пароль',
      ),
    });
    this.logger.log(`Password reset link sent to ${email}`);
  }

  private async safeSend(message: Parameters<MailerService['sendMail']>[0]) {
    try {
      await this.mailer.sendMail(message);
    } catch (error) {
      this.logger.warn(`Failed to send mail: ${message.subject}`, error as Error);
    }
  }

  private buildEmailTemplate(
    title: string,
    description: string,
    link: string,
    action: string,
  ) {
    return `
      <div style="font-family: Inter, Arial, sans-serif; padding: 24px; background:#f7f7fb;">
        <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:24px;padding:32px;border:1px solid #e5e7ef;">
          <tr>
            <td>
              <h2 style="margin-bottom:12px;color:#060714;">${title}</h2>
              <p style="margin-bottom:24px;color:#4c4f62;">${description}</p>
              <a href="${link}" style="display:inline-block;padding:14px 32px;border-radius:999px;background:#7a5af8;color:#fff;font-weight:600;text-decoration:none;">${action}</a>
              <p style="margin-top:32px;font-size:13px;color:#7f8299;">Если кнопка не работает, перейдите по ссылке: <br/><a href="${link}">${link}</a></p>
            </td>
          </tr>
        </table>
      </div>
    `;
  }
}

