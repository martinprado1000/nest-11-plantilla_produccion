import { ArgumentMetadata, Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class idMongoPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    if (!isValidObjectId(value)) throw new BadRequestException(`${value} not a valid MongoDB id`);
    return value;
  }
}
