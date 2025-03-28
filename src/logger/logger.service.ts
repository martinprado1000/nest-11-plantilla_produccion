import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class CustomLoggerService implements LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  error(context: string, message: string, trace?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(context: string, message: string, trace?: string) {
    this.logger.warn(message, { trace, context });
  }

  log(context: string, message: string, trace?: string) {
    this.logger.info(message, { trace, context });
  }
  
  http(context: string, message: string, trace?: string) {
    this.logger.http(message, { trace, context });
  }

  verbose(context: string, message: string, trace?: string) {
    this.logger.verbose(message, { trace, context });
  }

  debug(context: string, message: string, trace?: string) {
    this.logger.debug(message, { trace, context });
  }

  silly(context: string, message: string, trace?: string) {
    this.logger.silly(message, { trace, context });
  }

}
