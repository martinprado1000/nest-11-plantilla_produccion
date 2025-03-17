import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';

import { WinstonModule } from 'nest-winston';
import { join } from 'path';
import 'winston-mongodb';

import { envLoader } from './appConfig/envLoader.config';
import { envSchema } from './appConfig/envSchema.config';
import { Logger } from './appConfig/winston.config';
import { mongooseConfigFactory } from './appConfig/mongoose.config';

import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module'; 
import { SeedModule } from './seed/seed.module';
import { AuditLogsModule } from './auditLogs/auditLogs.module';

import { CorrelationIdMiddleware, } from './common/middlewares/correlation-id.middleware';
import { Request } from 'express';
//import { LoggerModule } from 'nestjs-pino';
import { TestModule } from './test/test.module';

@Module({
  imports: [
    
    // IMPORTANTE para usar el configModule en otros modulos hay que importarlo
    // npm i --save @nestjs/config  .Es para configurar las variables de entorno
    // npm i --save joi             .Es para validar las variables de entorno
    ConfigModule.forRoot({  // Obtiene variables de entorno y las valida segun le indiquemos. Por default las obtien de .env en la raiz
      load: [envLoader],            // Le indicamos de que archivo levantar las variables de entorno. Lo hago asi para poder estructurar mejor los datos.
      validationSchema: envSchema,  // Le indicamos cual es el archivo de validaciones de las variables de entorno (Los valores por defaul esta por escima de los valores por default que pudiera cargar en el envLoader)
      //isGlobal: true,             // Si dejo esta linea no haria falta importar el configModule en ningun modulo de ninguna entidad.  
    }),

    // npm i nestjs-pino pino-http
    // npm i -d pino pretty
    // LoggerModule.forRoot({
    //   pinoHttp: {
    //     transport: {
    //       target: 'pino-pretty', 
    //     },
    //     customProps: ( req: Request ) => { // Agrega propiedad 
    //       return { 
    //         correlatioId : CorrelationIdMiddleware.getCorrelationId()  // Agregamos el CorrelationId al log.
    //       }
    //     },
    //     //autoLogging: false, // Es para que no nos haga un autologeo automatico de request completed.
    //     serializers:{
    //       req : ()=> {return undefined},  // Esto para que no nos meta los datos del req en el log
    //       res : ()=> {return undefined}   // Esto para que no nos meta los datos del res en el log
    //     }
    //   },
    // }),

    //MongooseModule.forRoot('mongodb://localhost:27017/Nest-02-plantilla'), 
    MongooseModule.forRootAsync({
      imports: [ConfigModule],    // IMPORTA ConfigModule para poder usarlo en el useFactory
      inject: [ConfigService],    // Inyecta el ConfigService
      useFactory: mongooseConfigFactory,
    }),

    // Configuración de Winston
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: Logger,
    }),

    ServeStaticModule.forRoot({  // Indicamos la ruta de nuestras archivos publicos
      rootPath: join(__dirname,'..','public'), 
    }),

    //CommonModule,

    //LoggerModule,
    
    AuthModule,

    UsersModule,

    SeedModule,

    AuditLogsModule,

    TestModule,

  ]
  
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*'); 
  }
}
// Se reemplazo la config de middleware en la nueve version. Hay que agregar todas las rutas para que no lance el WARN
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(CorrelationIdMiddleware).forRoutes(
//       { path: 'api/auth/*', method: RequestMethod.ALL },
//       { path: 'api/users/*', method: RequestMethod.ALL },
//       // Agregar otras rutas aquí
//     );
//   }
// }