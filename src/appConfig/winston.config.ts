import { ConfigService } from '@nestjs/config';
import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import 'winston-mongodb';
import { CorrelationIdMiddleware } from 'src/common/middlewares/correlation-id.middleware';

const getCorrelationId = () => CorrelationIdMiddleware.getCorrelationId() || 'no-correlation-id';

const logFormatCompart = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD_HH:mm:ss' }),
);

const mongoLogFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD_HH:mm:ss' }),
  winston.format((info) => {
    info.correlationId = getCorrelationId();
    info.trace = info.trace || 'No-Trace'; 
    info.context = info.context || 'No-Context';
    return info;
  })(),
  winston.format.json(),
);


export const Logger = (configService: ConfigService): WinstonModuleOptions => ({
  transports: [

    new winston.transports.Console({
      level: 'silly',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD_HH:mm:ss' }),
        winston.format.ms(),
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, context, trace }) => {
          return `[${level}] ${timestamp} [Cid: ${getCorrelationId()}] ${ context || 'No-Context'}: ${message}. Trace: ${ trace || 'No-Trace'}`;
        }),
      ),
    }),

    new winston.transports.DailyRotateFile({
      level: 'http',
      filename: `./logsFiles/logsRatate-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      maxSize: '5m',
      maxFiles: '3d',
      zippedArchive: false,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format(info => {
          return {
            ...info,
            correlationId: getCorrelationId(),
            trace: info.trace || 'No-Trace'
          };
        })(),
        winston.format.json()
      )
    }),    

    new winston.transports.MongoDB({
      level: 'http',
      format: mongoLogFormat,
      db: configService.get<string>('database.uri') || 'mongodb://localhost:27017/nest-11-plantilla',
      collection: 'logs',
    }),
    
  ],
});