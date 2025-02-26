import { Role } from '@common/enums';

export interface PayloadLogin extends Payload {
  sub: string;
  name: string;
  roles: Role[];
}
export interface Payload {
  phoneNumber?: string;
  email?: string;
  iat?: number;
  exp?: number;
}
