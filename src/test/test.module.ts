import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { TestController } from './test.controller';
import { AuditLogsModule } from 'src/auditLogs/auditLogs.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [TestController],
  providers: [TestService],
  imports: [
    AuditLogsModule, 
    UsersModule
  ],
  exports: [TestService],
})
export class TestModule {}
