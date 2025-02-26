import { IsOptional, IsString } from 'class-validator';

export class PaymentSettingsePayco {
  @IsOptional()
  @IsString()
  publicKey?: string;
}
