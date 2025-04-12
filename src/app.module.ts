import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

import { WinstonModule } from 'nest-winston';
import { join } from 'path';
import 'winston-mongodb';


import { envLoader } from 'src/appConfig/envLoader.config';
import { envSchema } from 'src/appConfig/envSchema.config';
import { Logger } from 'src/appConfig/winston.config';
import { mongooseConfigFactory } from 'src/appConfig/mongoose.config';

import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module'; 
import { SeedModule } from 'src/seed/seed.module';
import { AuditLogsModule } from 'src/auditLogs/auditLogs.module';
import { SendEmailModule } from './send-mail/send-email.module';
import { CorrelationIdMiddleware, } from 'src/common/middlewares/correlation-id.middleware';
//import { CommonModule } from 'src/common/common.module';
//import { LoggerModule } from 'src/logger/logger.module';


@Module({
  imports: [
    
    ConfigModule.forRoot({
      load: [envLoader],
      validationSchema: envSchema,
    }),
 
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: mongooseConfigFactory,
    }),

    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: Logger,
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname,'..','public'), 
    }),

    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: "martinprado1000@gmail.com",
          pass: "ktrv czmi swtr rzob",
        },
      },
      defaults: {
        from:'"nest-modules" <modules@nestjs.com>',
      },
    }),

    //CommonModule,

    //LoggerModule,
    
    SendEmailModule,

    AuthModule,

    UsersModule,

    SeedModule,

    AuditLogsModule,

  ]
  
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*'); 
  }
}