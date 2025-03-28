import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuditLogsController } from 'src/auditLogs/auditLogs.controller';
import { AuditLogsService } from 'src/auditLogs/auditLogs.service';
import { AuditLogs, AuditLogsSchema } from 'src/auditLogs/schema/auditLogs.schema';
import { USERS_REPOSITORY_INTERFACE } from 'src/users/interfaces/users-repository.interface';
import { AuditLogsRepository } from './auditLogs.repository';

@Module({

  controllers: [AuditLogsController],

  providers: [
    AuditLogsService,
    AuditLogsRepository,
    {
      provide: USERS_REPOSITORY_INTERFACE,
      useClass: AuditLogsRepository,
    },
  ],

  imports: [
    MongooseModule.forFeature([
      { name: AuditLogs.name, schema: AuditLogsSchema },
    ]),
    ConfigModule,
  ],
  
  exports: [AuditLogsService], 
})
export class AuditLogsModule {}
