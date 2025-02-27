import { Request } from 'express';
import { UserPlatform } from '../../modules/auth/interfaces';

export const extractUserFromRequest = (request: Request): UserPlatform => {
  return request.user as UserPlatform;
};
