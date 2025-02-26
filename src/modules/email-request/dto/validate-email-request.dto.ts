import { EmailRequestDto } from './email-request.dto';

export type ValidateEmailRequest = Omit<EmailRequestDto, 'expiresIn'> & {
  token: string;
};
