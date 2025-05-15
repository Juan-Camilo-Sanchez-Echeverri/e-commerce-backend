import {
  IsString,
  MinLength,
  IsEmail,
  IsOptional,
  MaxLength,
  IsArray,
  IsBoolean,
  IsEnum,
} from 'class-validator';

import { IsNotBlank } from '@common/decorators';
import { Role, Status } from '@common/enums';

export class CreateUserDto {
  @IsNotBlank({ message: 'name is required' })
  @MinLength(3)
  name: string;

  @IsNotBlank({ message: 'lastName is required' })
  @MinLength(3)
  lastName: string;

  @IsNotBlank({ message: 'email is required' })
  @IsEmail()
  email: string;

  @IsNotBlank({ message: 'phone is required' })
  phone: string;

  @IsString()
  @MinLength(8)
  @MaxLength(16)
  @IsOptional()
  password?: string;

  @IsEnum(Status)
  status: Status;

  @IsBoolean()
  @IsOptional()
  validPhone?: boolean;

  @IsEnum(Role, { each: true })
  @IsOptional()
  @IsArray()
  roles?: Role[];

  lastLogin?: Date | null;
}
