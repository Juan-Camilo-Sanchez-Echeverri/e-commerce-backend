import { IsEmail, IsOptional } from 'class-validator';
import { IsNotBlank, IsPassword } from '@common/decorators';

export class ActivateDto {
  @IsNotBlank({ message: 'the token cannot be empty' })
  token: string;

  @IsNotBlank({ message: 'the email cannot be empty' })
  @IsEmail()
  email: string;

  @IsPassword()
  @IsOptional()
  password?: string;
}
