import {
  Injectable,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Document as DocumentMongoose, Model } from 'mongoose';

import { AuditLogsRepositoryInterface } from 'src/auditLogs/interfaces/auditLogs-repository.interface';
import { AuditLogs } from 'src/auditLogs/schema/auditLogs.schema';
import { CreateAuditLogsDto } from 'src/auditLogs/dto/create-auditLogs.dto';

@Injectable()
export class AuditLogsRepository implements AuditLogsRepositoryInterface {
  constructor(
    @InjectModel(AuditLogs.name) private auditLogsModel: Model<AuditLogs>,
  ) {}

    // -----------CREATE------------------------------------------------------------------------------------
    async create(createAuditLogsDto: CreateAuditLogsDto): Promise<AuditLogs> {
      return await this.auditLogsModel.create(createAuditLogsDto);
    }

  // -----------FIND ALL---------------------------------------------------------------------------------
  async findAll(limit: number, offset: number): Promise<AuditLogs[]> {
    return await this.auditLogsModel
      .find()
      .skip(offset)
      .limit(limit);
  }

  // -----------FIND BY ID-------------------------------------------------------------------------------
  async findById(id: string): Promise<DocumentMongoose | null> {
    return await this.auditLogsModel.findById(id).lean() ;
  }

}
