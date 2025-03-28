import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CreateAuditLogsDto } from 'src/auditLogs/dto/create-auditLogs.dto';
import {
  AUDITLOG_REPOSITORY_INTERFACE,
  AuditLogsRepositoryInterface,
} from 'src/auditLogs/interfaces/auditLogs-repository.interface';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class AuditLogsService {
  private defaultLimit: number;
  constructor(

    private readonly configService: ConfigService,

    @Inject(AUDITLOG_REPOSITORY_INTERFACE)

    private readonly auditLogsRepository: AuditLogsRepositoryInterface,

  ) {
    this.defaultLimit = configService.get<number>('pagination.defaultLimit', 3);
  }
  async create(createAuditLogsDto: CreateAuditLogsDto) {
    const res =  await this.auditLogsRepository.create(createAuditLogsDto);
    return res;
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = 0 } = paginationDto;
    return await this.auditLogsRepository.findAll(limit, offset);
  }

  async findOne(term: string) {
    return await this.auditLogsRepository.findById(term);
  }
}
