import type { TypeRequest } from '../types/type-request';

export class EmailRequestDto {
  email: string;
  type: TypeRequest;
  expiresIn: Date;
  password?: boolean;
}
