import { IsInt, IsOptional } from 'class-validator';

export class SettingsProductDto {
  @IsInt()
  @IsOptional()
  genericStock?: number;

  @IsInt()
  @IsOptional()
  limitWarningStock?: number;
}
