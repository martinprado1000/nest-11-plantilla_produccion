import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';

import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { LoginUserDto } from 'src/auth/dto/login-user.dto';

import { User } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto, ResponseUserDto } from 'src/users/dto';
import { Role } from 'src/users/enums/role.enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // -----------REGISTER-------------------------------------------------------------------------------
  async register(createAuthDto: CreateUserDto) {
    if (
      Array.isArray(createAuthDto.roles) &&   // Se fija si roles es un array (o sea, si viene).
      JSON.stringify(createAuthDto.roles) !== JSON.stringify([Role.USER]) // Se fija si es distinto a USER
    ) {
      throw new BadRequestException(
        'Operación no permitida: Solo se pueden registrar usuarios de tipo: USER',
      );
    }
    const userResponse = await this.userService.create(createAuthDto);

    return {
      ...userResponse,
      token: this.getJwtToken({ id: userResponse.id }),
    };
  }

  // -----------LOGIN-------------------------------------------------------------------------------
  async login(loginAuthDto: LoginUserDto) {
    let userResponse: ResponseUserDto;
    const { password, email } = loginAuthDto;

    const user = await this.userService.findOne(email);

    if (user?.isActive === false)
      throw new UnauthorizedException(
        'Usuario inactivo, comuniquese con el administrador',
      );

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Usuario o contraseña incorrecta');

    userResponse = plainToInstance(ResponseUserDto, user, {
      excludeExtraneousValues: true,
    });

    if (user._id) {
      return {
        ...userResponse,
        token: this.getJwtToken({ id: user._id }),
      };
    }
  }

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
