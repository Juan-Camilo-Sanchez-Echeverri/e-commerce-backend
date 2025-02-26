import { UserPlatform } from './user.interface';

export interface ResponseAuth {
  token: string;
  user: UserPlatform;
}
