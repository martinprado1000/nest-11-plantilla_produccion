import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  Query,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto, UpdateUserDto, EmailUserDto } from 'src/users/dto';
import { CustomLoggerService } from 'src/logger/logger.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { idMongoPipe } from 'src/common/pipes/idMongo.pipe';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly logger: CustomLoggerService,
  ) {}

  @Get('users/allUsers') // Obtiene todos los usuarios, activos e inactivos
  @ApiResponse({ status: 200, description: 'Users list', type: CreateUserDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  //@Auth(ValidRoles.SUPERADMIN, ValidRoles.ADMIN)
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.usersService.findAllResponse(paginationDto);
  }

  @Get('users') // Obtiene todos los usuarios activos
  @ApiResponse({ status: 200, description: 'Users list', type: CreateUserDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  //@Auth(ValidRoles.SUPERADMIN, ValidRoles.ADMIN)
  async findAllActiveUsers(@Query() paginationDto: PaginationDto) {
    return await this.usersService.findAllActiveUsersResponse(paginationDto);
  }

  @Get('users/:term') // Obtiene usuarios por term entre usuarios activos
  @ApiResponse({ status: 200, description: 'Users list by term', type: CreateUserDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  //@Auth(ValidRoles.SUPERADMIN, ValidRoles.ADMIN)
  async findOne(@Param('term') term: string) {
    return await this.usersService.findOneResponse(term);
  }

  @Post('users')
  @ApiResponse({ status: 201, description: 'User was created', type: CreateUserDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden, token related' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(ValidRoles.SUPERADMIN,ValidRoles.ADMIN)
  async create(
    @Body() createUserDto: CreateUserDto,
    @GetUser() user: CreateUserDto
  ) {
    return await this.usersService.create(createUserDto, user); 
  }

  @Patch('users/:id')
  @ApiResponse({ status: 200, description: 'User was updated', type: UpdateUserDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 403, description: 'Forbidden, token related' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(ValidRoles.SUPERADMIN,ValidRoles.ADMIN)
  async update(
    @Param('id', idMongoPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: CreateUserDto,
  ) {
    return await this.usersService.update(id, updateUserDto, user);
  }

  @Patch('recoveryPassword')
  @ApiResponse({ status: 204, description: 'User password was recovered'})
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async recoveryPassword(
    @Body() EmailUserDto: EmailUserDto,
  ) {
    return await this.usersService.recoveryPassword(EmailUserDto);
  }

  @Delete('users/:id')
  @ApiResponse({ status: 204, description: 'User was deleted'})
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 403, description: 'Forbidden, token related' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(ValidRoles.SUPERADMIN,ValidRoles.ADMIN)
  @HttpCode(204)
  async remove(
    @Param('id', idMongoPipe) id: string, 
    @GetUser() user: CreateUserDto
  ) {
    return await this.usersService.userIsActiveFalse(id, user);
  }

}
