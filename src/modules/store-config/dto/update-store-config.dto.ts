import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { GatewayName } from '../../payments/enums/gateway.enums';
import { PaymentSettingsePayco, PaymentSettingsPayU } from '../../payments/dto';
import { Type } from 'class-transformer';
import { SettingsProductDto } from './settings-product.dto';

export class UpdateStoreConfigDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  color?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  logo?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  cover?: string;

  @IsOptional()
  @IsEnum(GatewayName)
  @IsNotEmpty()
  gatewayName?: GatewayName;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PaymentSettingsePayco)
  settingsePayco?: PaymentSettingsePayco;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PaymentSettingsPayU)
  settingsPayU?: PaymentSettingsPayU;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SettingsProductDto)
  settingsProduct: SettingsProductDto;
}
