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
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { ResponseUserDto } from 'src/users/dto/response-user.dto';
import { Role } from 'src/users/enums/role.enums';
import { USERS_REPOSITORY_INTERFACE, UsersRepositoryInterface } from 'src/users/interfaces/users-repository.interface';

import { CustomLoggerService } from 'src/logger/logger.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersService {

  private defaultLimit: number;

  constructor(

    @InjectModel(User.name) private userModel: Model<User>,

    private readonly configService: ConfigService,

    @Inject(USERS_REPOSITORY_INTERFACE) private readonly usersRepository: UsersRepositoryInterface,
    
    private readonly logger: CustomLoggerService,

  ) {
    this.defaultLimit = configService.get<number>('pagination.defaultLimit', 3);
  }

  // -----------FIND ALL---------------------------------------------------------------------------------
  async findAll(paginationDto: PaginationDto): Promise<User[]> {
    const { limit = this.defaultLimit, offset = 0 } = paginationDto;
    return await this.usersRepository.findAll(limit, offset);
  }

  // -----------FIND ALL RESPONSE-------------------------------------------------------------
  async findAllResponse(paginationDto: PaginationDto): Promise<ResponseUserDto[]> {
    const users = await this.findAll(paginationDto);
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
    if (!user) throw new NotFoundException(`No se encontró el usuario: ${term}`);

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
  async create(createUserDto: CreateUserDto, activeUser?: CreateUserDto ): Promise<ResponseUserDto> {

    await this.isSuperadminCreate(createUserDto, activeUser);

    let { password, confirmPassword } = createUserDto;
    
    if (password != confirmPassword)
      throw new BadRequestException('Las contraseñas no coinciden');

    const hashedPassword: string = await bcrypt.hash(password, 10);

    createUserDto.password = hashedPassword;

    try {
      let user = await this.usersRepository.create(createUserDto)

      const userResponse: ResponseUserDto = plainToInstance(
        ResponseUserDto,
        user.toObject(),
        {
          excludeExtraneousValues: true,
        },
      );

      this.logger.http(UsersService.name, `Usuario ${user._id} creó al usuario ${userResponse.id}`, `POST/${userResponse.id}`);

      return userResponse;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }
  
  // -----------UPDATE------------------------------------------------------------------------------------
  async update(id: string, updateUserDto: UpdateUserDto, activeUser: CreateUserDto): Promise<ResponseUserDto> {
    await this.isSuperadminEdit(id, activeUser);

    let { password, confirmPassword } = updateUserDto;

    let updatedUser: DocumentMongoose | null;

    if (password || confirmPassword) {
      if (password !== confirmPassword)
        throw new BadRequestException('Las contraseñas no coinciden');

      const hashedPassword = await bcrypt.hash(password, 10);
      updateUserDto.password = hashedPassword;
    }

    try {
      updatedUser = await this.usersRepository.update(id, updateUserDto)

    } catch (error) {
      this.handleDBErrors(error);
    }

    if (!updatedUser) {
      throw new NotFoundException(`Usuario con id: ${id} no encontrado`);
    }

    const updatedUserPlain = plainToInstance(ResponseUserDto, updatedUser.toObject(), {
      excludeExtraneousValues: true,
    });

    this.logger.http(UsersService.name, `Usuario ${activeUser._id} editó al usuario ${id}`, `PATCH/${id}`);

    return updatedUserPlain
  }

  // -----------DELETE-------------------------------------------------------------------------------
  async delete(id: string, activeUser: CreateUserDto): Promise<string> {
    await this.isSuperadminEdit(id,activeUser)

    let deletedUser: DocumentMongoose | null;
    
    try {
      deletedUser = await this.usersRepository.delete(id);

      this.logger.http(UsersService.name, `Usuario ${activeUser._id} eliminó al usuario ${id}`, `DELETE/${id}`);

    } catch (error) {
      this.handleDBErrors(error);
    }

    return `Usuario con id: ${id} eliminado`;
  }

  // -----------USER ISACTIVE FALSE-------------------------------------------------------------------------------
  async userIsActiveFalse(id: string, activeUser: CreateUserDto ): Promise<ResponseUserDto>{
  
    await this.isSuperadminEdit(id, activeUser);
    
    const userUpdated = await this.update(id, {isActive:false}, activeUser);

    this.logger.http(UsersService.name, `Usuario ${activeUser._id} paso a inactivo al usuario ${id}`, `DELETE/${id}`);

    return userUpdated;
  }

  // -----------DELETE ALL USERS-------------------------------------------------------------------------------
  async removeAllUsers(): Promise<string> {
    try {
      this.usersRepository.deleteAllUsers();
      this.logger.http(UsersService.name, `Documentos de la collecciín users eliminada`);
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

  private async isSuperadminEdit(id: string, userActive: CreateUserDto ): Promise< void | string > {
    const userToDelete = await this.findOneResponse(id)
    if ( !userActive.roles?.includes(Role.SUPERADMIN) && userToDelete.roles.includes(Role.SUPERADMIN)) throw new BadRequestException('Operación no permitida: No puede modificar ni eliminar un usuario SUPERADMIN')
    return
  }

  private async isSuperadminCreate(createUserDto: CreateUserDto, userActive?: CreateUserDto ): Promise< void | string > {
    if ( !userActive?.roles?.includes(Role.SUPERADMIN) && createUserDto.roles?.includes(Role.SUPERADMIN)) throw new BadRequestException('Operación no permitida: No puede crear un usuario SUPERADMIN')
    return
  }

  private handleDBErrors(error: any): never {
    
    if (error.code === 11000)
      throw new BadRequestException(
        `El usuario ${JSON.stringify(error.keyValue.email)} ya existe`,
      );

    throw new InternalServerErrorException('Please check server logs');
  }
}
