import { ApiResponse } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
} from '@nestjs/common';

import { AuthService } from 'src/auth/auth.service';
import { LoginUserDto } from 'src/auth/dto/login-user.dto';
import { User } from 'src/users/schemas/user.schema';
import { CreateUserDto } from 'src/users/dto';

import {
  Auth,
  GetUser,
} from './decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiResponse({ status:201, description: 'User was registered', type: User })
  @ApiResponse({ status:400, description: 'Bad request' })
  async registerUser(@Body() createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }

  @Post('login')
  @ApiResponse({ status:201, description: 'User logged in', type: User })
  @ApiResponse({ status:400, description: 'Bad request' })
  @ApiResponse({ status:401, description: 'User is inactive, talk with an admin' })
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @ApiResponse({ status:200, description: 'Check-status OK', type: User })
  @ApiResponse({ status:400, description: 'Bad request' })
  @ApiResponse({ status:401, description: 'Unauthorized'})
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

}
