import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../enums/role.enums';
import { ApiProperty } from '@nestjs/swagger';

@Schema({
  timestamps: true,
})
export class User extends Document {
  
  @ApiProperty({
    description: 'User name',
    example: 'Richard',
    required: true,
  })
  @Prop({
    trim: true,
    required: true,
    set: (value: string) => {
      if (!value) return value;
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    },
  })
  name: string;

  @ApiProperty({
    description: 'User lastname',
    example: 'Kendy',
    required: true,
  })
  @Prop({
    trim: true,
    required: true,
    set: (value: string) => {
      if (!value) return value;
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    },
  })
  lastname: string;

  @ApiProperty({
    description: 'User email',
    example: 'richard@gmail.com',
    uniqueItems: true,
    required: true,
  })
  @Prop({
    required: true,
    index: true,
    unique: true,
    trim: true,
    lowercase: true,
  })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'Test123##',
    required: true,
  })
  @Prop({
    required: true,
    trim: true,
  })
  password: string;

  @ApiProperty({
    description: 'User role',
    example: ['USER', 'OPERATOR', 'ADMIN', 'SUPERADMIN'],
    enum: Role,
    default: Role.USER,
    required: false,
  })
  @Prop({
    required: true,
    trim: true,
    default: Role.USER,
    uppercase: true
  })
  roles: Role[];

  @ApiProperty({
    description: 'User is active?',
    example: [true, false],
    default: true,
    required: false,
  })
  @Prop({
    required: false,
    default: true,
  })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User); 
