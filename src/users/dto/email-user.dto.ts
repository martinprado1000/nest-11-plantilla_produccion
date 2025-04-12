import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEmail,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class EmailUserDto {

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

}

