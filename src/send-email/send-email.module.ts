import { Module } from '@nestjs/common';
import { SendEmailService } from 'src/send-email/send-email.service';

@Module({
  providers: [SendEmailService],
  exports: [SendEmailService]
})
export class SendEmailModule {}
