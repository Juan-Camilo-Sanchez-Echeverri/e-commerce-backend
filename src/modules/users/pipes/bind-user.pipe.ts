import { PipeTransform, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { Request } from 'express';

import { Role } from '../../../common/enums/roles.enums';

@Injectable()
export class BindUserPipe implements PipeTransform {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  transform(value: any): any {
    const user = (this.request as any).user;
    const { _id } = user;
    if (user.roles.includes(Role.Admin)) {
      value['users'] = [_id];
    }
    return value;
  }
}
