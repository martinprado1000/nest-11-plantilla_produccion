import { ConfigService } from '@nestjs/config';
import { MailerOptions } from '@nestjs-modules/mailer';

export const mailerConfigFactory = async (
  configService: ConfigService,
): Promise<MailerOptions> => ({
  transport: {
    host: configService.get<string>('MAILER_HOST'),
    port: configService.get<number>('MAILER_PORT'),
    secure: false,
    auth: {
      user: configService.get<string>('MAILER_USER'),
      pass: configService.get<string>('MAILER_PASS'),
    },
  },
  defaults: {
    from: `"No Reply" <${configService.get<string>('MAIL_FROM')}>`,
  },
});