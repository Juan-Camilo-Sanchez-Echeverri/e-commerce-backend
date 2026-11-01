import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

import { extractUserFromRequest } from '../helpers';
import { UserPlatform } from '../../modules/auth/interfaces';

export const User = createParamDecorator(
  (data: keyof UserPlatform | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user: UserPlatform | undefined = extractUserFromRequest(request);

    if (!data) return user;

    const record = user as unknown as Record<string, unknown>;

    return record[data];
  },
);
