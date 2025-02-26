import { IsOptional, IsNotEmpty, IsString } from 'class-validator';
export class PaymentSettingsPayU {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  merchantId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  apiKey?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  apiLogin?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  accountId?: string;
}
