import { IsEmail, IsOptional, IsString } from 'class-validator';

import { IsNotBlank } from '@common/decorators';

export class CreateStoreCustomerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsNotBlank({ message: 'The email field is required' })
  @IsEmail()
  email: string;

  password?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  neighborhood?: string;

  @IsString()
  @IsOptional()
  shippingAddress?: string;
}
