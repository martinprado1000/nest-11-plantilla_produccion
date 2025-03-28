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
import { CreateUserDto, UpdateUserDto } from 'src/users/dto';
import { CustomLoggerService } from 'src/logger/logger.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { idMongoPipe } from 'src/common/pipes/idMongo.pipe';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly logger: CustomLoggerService,
  ) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Users list', type: CreateUserDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  //@Auth(ValidRoles.SUPERADMIN, ValidRoles.ADMIN)
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.usersService.findAllResponse(paginationDto);
  }

  @Get(':term')
  @ApiResponse({ status: 200, description: 'Users list by term', type: CreateUserDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  //@Auth(ValidRoles.SUPERADMIN, ValidRoles.ADMIN)
  async findOne(@Param('term') term: string) {
    return await this.usersService.findOneResponse(term);
  }

  @Post()
  @ApiResponse({ status: 201, description: 'User was created', type: CreateUserDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden, token related' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(ValidRoles.SUPERADMIN)
  async create(
    @Body() createUserDto: CreateUserDto,
    @GetUser() user: CreateUserDto
  ) {
    return await this.usersService.create(createUserDto, user); 
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'User was updated', type: UpdateUserDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 403, description: 'Forbidden, token related' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(ValidRoles.SUPERADMIN)
  async update(
    @Param('id', idMongoPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: CreateUserDto,
  ) {
    return await this.usersService.update(id, updateUserDto, user);
  }

  @Delete(':id')
  @ApiResponse({ status: 204, description: 'User was deleted'})
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 403, description: 'Forbidden, token related' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(ValidRoles.SUPERADMIN)
  @HttpCode(204)
  async remove(
    @Param('id', idMongoPipe) id: string, 
    @GetUser() user: CreateUserDto
  ) {
    return await this.usersService.userIsActiveFalse(id, user);
  }

}
