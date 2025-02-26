import { Request } from 'express';
import { UserDocument } from '@modules/users/schemas/user.schema';

export const extractUserFromRequest = (request: Request): UserDocument => {
  return request.user as UserDocument;
};
