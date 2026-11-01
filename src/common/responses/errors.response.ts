import { ServiceError } from '../interfaces/validation-error.interface';

export class ErrorsResponse {
  code: string;
  status: number;
  message: string;
}

export type { ServiceError };
