import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';

import { isValidObjectId } from 'mongoose';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    const { type } = metadata;

    if (type === 'param') {
      if (!isValidObjectId(value)) {
        throw new BadRequestException(`${value} is not a mongoId`);
      }
      return value;
    }

    return value;
  }
}
