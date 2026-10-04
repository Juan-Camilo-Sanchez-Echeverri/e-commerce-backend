import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

import { extractUserFromRequest } from '../helpers';
import { UserPlatform } from '../../modules/auth/interfaces';

export const User = createParamDecorator(
  (data: keyof UserPlatform, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = extractUserFromRequest(request);

    return data ? (user?.[data] as keyof UserPlatform) : user;
  },
);
