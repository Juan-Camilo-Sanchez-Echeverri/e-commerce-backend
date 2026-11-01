export type ValidationErrorDetails = Record<string, string[]>;

export interface ServiceError {
  code: string;
  message: string;
  details?: ValidationErrorDetails;
}
