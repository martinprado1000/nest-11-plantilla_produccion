import { Module } from '@nestjs/common';
import { CustomLoggerService } from 'src/logger/logger.service';

@Module({

  providers: [CustomLoggerService],

  exports: [CustomLoggerService],

})
export class LoggerModule {}
