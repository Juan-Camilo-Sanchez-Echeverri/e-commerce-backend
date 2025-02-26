import { Request } from 'express';

import { REQUEST } from '@nestjs/core';
import { PipeTransform, Injectable, Inject } from '@nestjs/common';

import { extractUserFromRequest } from '@common/helpers';

import { CreateFavoriteDto } from '../dto';

@Injectable()
export class TransformDtoPipe implements PipeTransform {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  transform(value: CreateFavoriteDto) {
    const { params } = this.request;
    const transformedDto = {
      ...value,
      user: extractUserFromRequest(this.request)._id,
    };

    return transformedDto;
  }
}
