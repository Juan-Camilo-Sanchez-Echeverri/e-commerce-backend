import { PipeTransform, Injectable, Inject } from '@nestjs/common';
import { UpdateStatusStoreDto } from '../dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class UpdateStatusPipe implements PipeTransform {
  constructor(@Inject(REQUEST) private readonly request: Request) {}
  transform(value: UpdateStatusStoreDto) {
    const path = this.request.path;
    value.user = this.request['user'];

    if (path.includes('activate')) {
      value.status = true;
    }

    if (this.request.path.includes('deactivate')) {
      value.status = false;
    }
    return value;
  }
}
