import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { initialData } from './data/seed-data';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from 'src/users/dto';
import { Role } from 'src/users/enums/role.enums';

@Injectable()
export class SeedService {
  private readonly passwordSeedUsers: string;
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    this.passwordSeedUsers = configService.get<string>(
      'passwordSeedUsers',
    ) as string;
  }

  // Ejecuta la semilla.
  async runSeed() {
    const user: CreateUserDto = {
      name: 'userSeed',
      lastname: 'userSeed',
      roles: Role.SUPERADMIN,
      email: 'userseed@gmail.com',
      password: 'usersEEd***123456**##',
      confirmPassword: 'usersEEd***123456**##',
      isActive: false,
    };
    try {
      const deleteData = await this.deleteData();
      console.log(deleteData);
      const deleteCollections = await this.deleteCollections();
      console.log(deleteCollections);
      const insertUserData = await this.insertUserData();
      console.log(insertUserData);
      return 'SEED EXECUTED';
    } catch (error) {
      throw new InternalServerErrorException('Please check server logs');
    }
  }

  // Borra todos los datos de las colecciones
  private async deleteData() {
    return await this.usersService.removeAllUsers();
  }

  // Borra las colecciones
  private async deleteCollections() {
    return await this.usersService.deleteUsersCollection();
  }

  // Inseta los usuarios hardcodeados
  private async insertUserData() {
    const seedUsers = initialData.users;
    seedUsers.forEach((user) => {
      this.usersService.create(user); 
    });
    return 'Usuarios creados con éxito';
  }
}
