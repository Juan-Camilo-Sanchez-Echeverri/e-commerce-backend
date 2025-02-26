import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

import { extractUserFromRequest } from '../helpers';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = extractUserFromRequest(request);

    return data ? user?.[data] : user;
  },
);
