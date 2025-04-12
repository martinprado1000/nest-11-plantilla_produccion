import {
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Document as DocumentMongoose, Model } from 'mongoose';

import { User } from 'src/users/schemas/user.schema';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { UsersRepositoryInterface } from 'src/users/interfaces/users-repository.interface';

@Injectable()
export class UsersRepository implements UsersRepositoryInterface {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  // -----------FIND ALL---------------------------------------------------------------------------------
  async findAll(limit: number, offset: number): Promise<User[]> {
    return await this.userModel
      .find()
      .skip(offset)
      .limit(limit);
  }

  // -----------FIND ALL USERS ACTIVE--------------------------------------------------------------------
  async findAllActiveUsers(limit: number, offset: number): Promise<User[]> {
    return await this.userModel
      .find({ isActive: true }) // solo usuarios activos
      .skip(offset)
      .limit(limit);
  }

  // -----------FIND BY ID-------------------------------------------------------------------------------
  async findById(id: string): Promise<DocumentMongoose | null> {
    return await this.userModel.findById(id).lean() ;
  }

  // -----------FIND BY EMAIL-------------------------------------------------------------------------------
  async findeByEmail(email: string): Promise<DocumentMongoose | null> {
    return await this.userModel.findOne({ email }).lean();
  }

  // -----------CREATE------------------------------------------------------------------------------------
  async create(createUserDto: CreateUserDto): Promise<User> {
    return (await this.userModel.create(createUserDto));
  }

  // -----------UPDATE-------------------------------------------------------------------------------
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    return await this.userModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
    });
  }

  // -----------DELETE-------------------------------------------------------------------------------
  async delete(id: string): Promise<DocumentMongoose | null> {
    return await this.userModel.findByIdAndDelete(id);
  }

  // -----------DELETE ALL USERS---------------------------------------------------------------------
  async deleteAllUsers() {
    await this.userModel.deleteMany();
  }
  // -----------DELETE COLLECTION USERS--------------------------------------------------------------
  async deleteUsersCollection() {
    await this.userModel.collection.drop();
  }
}
