import { Document as DocumentMongoose } from 'mongoose';
import { AuditLogs } from 'src/auditLogs/schema/auditLogs.schema';
import { CreateAuditLogsDto } from 'src/auditLogs/dto/create-auditLogs.dto';

export const AUDITLOG_REPOSITORY_INTERFACE = 'UsersRepositoryInterface';

export interface AuditLogsRepositoryInterface {
  create(createAuditLogsDto: CreateAuditLogsDto): Promise<AuditLogs>;
  findAll(limit: number, offset: number): Promise<AuditLogs[]>;
  findById(id: string): Promise<DocumentMongoose | null>;
}
