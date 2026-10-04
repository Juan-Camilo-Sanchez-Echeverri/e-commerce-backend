import { IsString, IsOptional } from 'class-validator';

export class ShippingAddressDto {
  @IsString()
  state: string;

  @IsString()
  city: string;

  @IsString()
  address: string;

  @IsString()
  @IsOptional()
  additionalInfo?: string;

  @IsString()
  phone: string;
}
