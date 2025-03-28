import { Controller, Get, Param, Query } from '@nestjs/common';

import { ApiResponse } from '@nestjs/swagger';
import { AuditLogsService } from 'src/auditLogs/auditLogs.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('auditLogs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Check-status OK' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.auditLogsService.findAll(paginationDto); 
  }

  @Get(':term')
  @ApiResponse({ status: 200, description: 'Check-status OK' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('term') term: string) {
    return this.auditLogsService.findOne(term);
  }
}
