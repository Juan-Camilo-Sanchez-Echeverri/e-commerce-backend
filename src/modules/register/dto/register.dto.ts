import { IsEmail, IsOptional } from 'class-validator';
import { IsNotBlank, IsPassword } from '@common/decorators';

export class RegisterDto {
  @IsNotBlank({ message: 'email is required' })
  @IsEmail()
  email: string;

  @IsOptional()
  @IsPassword()
  password?: string;
}
