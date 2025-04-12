import { Module } from '@nestjs/common';
import { SendEmailService } from './send-email.service';

@Module({
  providers: [SendEmailService],
  exports: [SendEmailService]
})
export class SendEmailModule {}
