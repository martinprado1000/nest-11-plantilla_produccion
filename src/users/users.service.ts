import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { Document as DocumentMongoose, isValidObjectId, Model } from 'mongoose';

import { User } from 'src/users/schemas/user.schema';
import {
  CreateUserDto,
  EmailUserDto,
  ResponseUserDto,
  UpdateUserDto,
} from './dto';
import { Role } from 'src/users/enums/role.enums';
import {
  USERS_REPOSITORY_INTERFACE,
  UsersRepositoryInterface,
} from 'src/users/interfaces/users-repository.interface';

import { CustomLoggerService } from 'src/logger/logger.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SendEmailService } from 'src/send-email/send-email.service';

@Injectable()
export class UsersService {
  private defaultLimit: number;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,

    private readonly configService: ConfigService,

    @Inject(USERS_REPOSITORY_INTERFACE)
    private readonly usersRepository: UsersRepositoryInterface,

    private readonly sendEmailService: SendEmailService,

    private readonly logger: CustomLoggerService,
  ) {
    this.defaultLimit = configService.get<number>('pagination.defaultLimit', 3);
  }

  // -----------FIND ALL---------------------------------------------------------------------------------
  async findAll(paginationDto: PaginationDto): Promise<User[]> {
    const { limit = this.defaultLimit, offset = 0 } = paginationDto;
    return await this.usersRepository.findAll(limit, offset);
  }

  // -----------FIND ALL USERS ACTIVE--------------------------------------------------------------------
  async findAllActiveUsers(paginationDto: PaginationDto): Promise<User[]> {
    const { limit = this.defaultLimit, offset = 0 } = paginationDto;
    return await this.usersRepository.findAllActiveUsers(limit, offset);
  }

  // -----------FIND ALL RESPONSE-------------------------------------------------------------
  async findAllResponse(
    paginationDto: PaginationDto,
  ): Promise<ResponseUserDto[]> {
    const users = await this.findAll(paginationDto);
    return plainToInstance(
      ResponseUserDto,
      users.map((user) => user.toObject()),
      {
        excludeExtraneousValues: true,
      },
    );
  }

  // -----------FIND ALL RESPONSE-------------------------------------------------------------
  async findAllActiveUsersResponse(
    paginationDto: PaginationDto,
  ): Promise<ResponseUserDto[]> {
    const users = await this.findAllActiveUsers(paginationDto);
    return plainToInstance(
      ResponseUserDto,
      users.map((user) => user.toObject()),
      {
        excludeExtraneousValues: true,
      },
    );
  }

  // -----------FIND ONE-------------------------------------------------------------------------------
  async findOne(term: string): Promise<CreateUserDto> {
    let user: DocumentMongoose | null;

    if (isValidObjectId(term)) {
      user = await this.usersRepository.findById(term);
    } else {
      user = await this.usersRepository.findeByEmail(term);
    }
    if (!user)
      throw new NotFoundException(`No se encontró el usuario: ${term}`);

    return plainToInstance(CreateUserDto, user);
  }
  // -----------FIND ONE RESPONSE------------------------------------------------------------
  async findOneResponse(term: string): Promise<ResponseUserDto> {
    const user = await this.findOne(term);

    return plainToInstance(ResponseUserDto, user, {
      excludeExtraneousValues: true,
    });
  }

  // -----------CREATE------------------------------------------------------------------------------------
  async create(
    createUserDto: CreateUserDto,
    activeUser?: CreateUserDto,
  ): Promise<ResponseUserDto> {
    await this.canCreate(createUserDto, activeUser);

    let { password, confirmPassword } = createUserDto;

    if (password != confirmPassword)
      throw new BadRequestException('Las contraseñas no coinciden');

    const hashedPassword: string = await bcrypt.hash(password, 10);

    createUserDto.password = hashedPassword;

    try {
      let user = await this.usersRepository.create(createUserDto);

      const userResponse: ResponseUserDto = plainToInstance(
        ResponseUserDto,
        user.toObject(),
        {
          excludeExtraneousValues: true,
        },
      );

      this.logger.http(
        UsersService.name,
        `Usuario ${user._id} creó al usuario ${userResponse.id}`,
        `POST/${userResponse.id}`,
      );

      return userResponse;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  // -----------UPDATE------------------------------------------------------------------------------------
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    activeUser: CreateUserDto | null,
  ): Promise<ResponseUserDto> {
    // Si activeUser no existe significa que viene de recoveryPassword
    if (activeUser)
      await this.canEdit(id, activeUser, updateUserDto.roles);

    let { password, confirmPassword } = updateUserDto;

    let updatedUser: DocumentMongoose | null;

    if (password || confirmPassword) {
      if (password !== confirmPassword)
        throw new BadRequestException('Las contraseñas no coinciden');

      const hashedPassword = await bcrypt.hash(password, 10);
      updateUserDto.password = hashedPassword;
    }

    try {
      updatedUser = await this.usersRepository.update(id, updateUserDto);
    } catch (error) {
      this.handleDBErrors(error);
    }

    if (!updatedUser) {
      throw new NotFoundException(`Usuario con id: ${id} no encontrado`);
    }

    const updatedUserPlain = plainToInstance(
      ResponseUserDto,
      updatedUser.toObject(),
      {
        excludeExtraneousValues: true,
      },
    );

    if (activeUser) // Si NO existe activeUser loggeo la acción en recovery password
    this.logger.http(
      UsersService.name,
      `Usuario ${activeUser?._id} editó al usuario ${id}`,
      `PATCH/${id}`,
    );

    return updatedUserPlain;
  }

  // -----------DELETE-------------------------------------------------------------------------------
  async delete(id: string, activeUser: CreateUserDto): Promise<string> {
    await this.canEdit(id, activeUser);

    let deletedUser: DocumentMongoose | null;

    try {
      deletedUser = await this.usersRepository.delete(id);

      this.logger.http(
        UsersService.name,
        `Usuario ${activeUser._id} eliminó al usuario ${id}`,
        `DELETE/${id}`,
      );
    } catch (error) {
      this.handleDBErrors(error);
    }

    return `Usuario con id: ${id} eliminado`;
  }

  // -----------USER ISACTIVE FALSE-------------------------------------------------------------------------------
  async userIsActiveFalse(
    id: string,
    activeUser: CreateUserDto,
  ): Promise<ResponseUserDto> {
    await this.canEdit(id, activeUser);

    const userUpdated = await this.update(id, { isActive: false }, activeUser);

    this.logger.http(
      UsersService.name,
      `Usuario ${activeUser._id} paso a inactivo al usuario ${id}`,
      `DELETE/${id}`,
    );

    return userUpdated;
  }

  // -----------RECOVERY PASSWORD-------------------------------------------------------------------------------
  async recoveryPassword(emailUserDto: EmailUserDto) {
    const userFound = await this.findOneResponse(emailUserDto.email);

    try {
      const randomString = generateRandomString();

      await this.update(
        userFound.id,
        {
          password: randomString,
          confirmPassword: randomString,
        },
        null,
      );

      this.sendEmailService.recoveryPassword(emailUserDto, randomString);

      this.logger.http(
        UsersService.name,
        `Usuario ${emailUserDto.email} restableció su contraseña`,
        `PATCH/recoveryPassword`,
      );

      return { message: `Usuario: ${emailUserDto.email} restableció su contraseña`};
    } catch (error) {
      console.log(error);
      this.handleDBErrors(error);
    }
  }

  // -----------DELETE ALL USERS-------------------------------------------------------------------------------
  async removeAllUsers(): Promise<string> {
    try {
      this.usersRepository.deleteAllUsers();
      this.logger.http(
        UsersService.name,
        `Documentos de la collecciín users eliminada`,
      );
      return 'Documentos de la collecciín users eliminada con éxito';
    } catch (error) {
      throw new Error(
        'No se pudo eliminar los documentos de la colección users',
      );
    }
  }

  // -----------DELETE COLLECTION USERS-------------------------------------------------------------------------------
  async deleteUsersCollection(): Promise<string> {
    try {
      this.usersRepository.deleteUsersCollection();
      this.logger.http(UsersService.name, `Colección users eliminada`);
      return 'Colección users eliminada con éxito';
    } catch (error) {
      throw new Error('No se pudo eliminar la colección users');
    }
  }

  // -----------GENERETE SEED USERS-------------------------------------------------------------------------------
  // Crea usuario hadcodeados en la coleccion users.
  // async genereteSeedUsers(createUserDto: CreateUserDto): Promise<ResponseUserDto> {
  //   try {
  //     return await this.create(createUserDto);
  //   } catch (error) {
  //     throw new Error('No se pudo crear la colección users');
  //   }
  // }

  private async canEdit(
    id: string,
    userActive: CreateUserDto | null,
    roleToEdit: Role | Role[] | undefined = Role.USER, // Si no viene ningun rol le asigno USER para poder eliminar.
  ): Promise<void | string> {
    const userToEdit = await this.findOneResponse(id);

    if (userActive?.roles?.includes(Role.SUPERADMIN)) return;

    const hasUserAndOperator =
      roleToEdit?.includes(Role.USER) || roleToEdit?.includes(Role.OPERATOR);

    if (
      (hasUserAndOperator &&
        userActive?.roles?.includes(Role.ADMIN) &&
        userToEdit?.roles?.includes(Role.USER)) ||
      (userActive?.roles?.includes(Role.ADMIN) &&
        userToEdit?.roles?.includes(Role.OPERATOR))
    )
      return;

    throw new BadRequestException(
      `Operación no permitida para usuario ${Role.ADMIN}`,
    );
  }

  private async canCreate(
    createUserDto: CreateUserDto,
    userActive?: CreateUserDto,
  ): Promise<void | string> {
    if (!userActive) return; // Si userActive no existe retorno porque es un registro

    if (
      userActive?.roles?.includes(Role.SUPERADMIN) ||
      (userActive?.roles?.includes(Role.ADMIN) &&
        createUserDto.roles?.includes(Role.USER)) ||
      (userActive?.roles?.includes(Role.ADMIN) &&
        createUserDto.roles?.includes(Role.OPERATOR))
    )
      return;
    throw new BadRequestException(
      `Operación no permitida: No puede crear un usuario ${createUserDto.roles}`,
    );
  }

  private handleDBErrors(error: any): never {
    if (error.code === 11000)
      throw new BadRequestException(
        `El usuario ${JSON.stringify(error.keyValue.email)} ya existe`,
      );

    throw new InternalServerErrorException('Please check server logs');
  }
}

const generateRandomString = (length = 8) => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
};
