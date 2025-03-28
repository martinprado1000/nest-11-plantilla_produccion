import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsEmail,
  IsOptional,
  IsEnum,
  Matches,
  IsBoolean,
  IsMongoId
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';
import { Role } from 'src/users/enums/role.enums';

export class CreateUserDto {

  @ApiProperty({
    description: 'Mongo Id (unique)',
    type: 'string',
    nullable: true,
    example: "67a1a6c23504ec3e184cc14a",
  })
  @IsOptional()
  @IsMongoId()
  @Transform(({ value }) =>
    Types.ObjectId.isValid(value) ? value.toString() : value,
  )
  _id?: string;

  @ApiProperty({
    description: 'User name',
    type: 'string',
    minLength: 2,
    nullable: false,
    example: 'Richard'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @Matches(/^[^\s]+$/, { message: 'The name must not contain spaces' })
  @Transform(({ value }) => capitalize(value))
  name: string;

  @ApiProperty({
    description: 'User lastname',
    type: 'string',
    minLength: 2,
    nullable: false,
    example: 'Kendy'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @Matches(/^[^\s]+$/, { message: 'The lastname must not contain spaces' })
  @Transform(({ value }) => capitalize(value))
  lastname: string;

  @ApiProperty({
    description: 'User email',
    type: 'string',
    nullable: false,
    example: 'richard@gmail.com'
  })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({
    description: 'User password',
    type: 'string',
    nullable: false,
    example: 'Test123##'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @Matches(/^\S*$/, { message: 'La contraseña no debe contener espacios' })
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'La contraseña debe tener una letra mayúscula, minúscula y un número.',
  })
  password: string;

  @ApiProperty({
    description: 'User confirm password',
    type: 'string',
    nullable: false,
    example: 'Test123##'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @Matches(/^\S*$/, {
    message: 'La confirmación de contraseña no debe contener espacios',
  })
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'La confirmación de contraseña debe tener una letra mayúscula, minúscula y un número.',
  })
  confirmPassword: string;

  @ApiProperty({
    description: 'User role',
    type: 'array',
    enum: Role,
    nullable: true,
    example: 'USER'
  })
  @IsOptional()
  @IsEnum(Role, { each: true })
  @Transform(({ value }) => value ?? [Role.USER])
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      return [value.toUpperCase()];
    }
    if (Array.isArray(value)) {
      return value.map((v) => (typeof v === 'string' ? v.toUpperCase() : v));
    }
    return value;
  })
  roles?: Role[] | Role;

  @ApiProperty({
    description: 'User is active?',
    type: 'boolean',
    nullable: true,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}
