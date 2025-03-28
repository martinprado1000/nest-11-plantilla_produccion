import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';

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

    //CommonModule,

    //LoggerModule,
    
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