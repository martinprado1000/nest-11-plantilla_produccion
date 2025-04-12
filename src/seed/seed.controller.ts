import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { SeedService } from './seed.service';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get('executeSeed')
  @ApiResponse({ status: 200, description: 'Seed executed'})
  @ApiResponse({ status: 403, description: 'Forbidden, token related' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  //@Auth(ValidRoles.SUPERADMIN)
  executeSeed() {
    return this.seedService.runSeed();
  }
}