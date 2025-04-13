import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule} from '@nestjs/config';

import { UsersController } from 'src/users/users.controller';
import { UsersService } from 'src/users/users.service';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { UsersRepository } from 'src/users/users.repository';
import {
  USERS_REPOSITORY_INTERFACE,
} from 'src/users/interfaces/users-repository.interface';

import { CustomLoggerService } from 'src/logger/logger.service';
import { AuthModule } from 'src/auth/auth.module';
import { AuditLogsModule } from 'src/auditLogs/auditLogs.module';
import { SendEmailModule } from 'src/send-email/send-email.module';

@Module({

  controllers: [UsersController],
  
  providers: [ 
    UsersService,
    CustomLoggerService,
    UsersRepository,
    {
      provide: USERS_REPOSITORY_INTERFACE,
      useClass: UsersRepository 
    },
  ],
  
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ConfigModule, 
    forwardRef(() => AuthModule),
    AuditLogsModule,
    SendEmailModule,
  ],

  exports: [UsersService],
})
export class UsersModule {}
