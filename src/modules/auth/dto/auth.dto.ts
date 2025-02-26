import { IsEmail, IsString } from 'class-validator';
import { IsNotBlank, IsPassword } from '@common/decorators';

export class PhoneAuthenticationDto {
  @IsNotBlank({ message: 'the phone cannot be empty' })
  phone: string;
}

export class LoginDto {
  @IsNotBlank({ message: 'the email cannot be empty' })
  @IsEmail()
  email: string;

  @IsNotBlank({ message: 'the password cannot be empty' })
  @IsPassword()
  password: string;
}

export class RecoverPasswordDto {
  @IsNotBlank({ message: 'the email cannot be empty' })
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsNotBlank({ message: 'the email cannot be empty' })
  @IsEmail()
  email: string;

  @IsNotBlank({ message: 'the password cannot be empty' })
  @IsPassword()
  password: string;
}

export class LogoutDto {
  @IsNotBlank({ message: 'the email cannot be empty' })
  @IsEmail()
  email: string;
}
