import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class PayShoppingCartDto {
  @IsString()
  @IsOptional()
  referencePay?: string;

  @IsString()
  @IsOptional()
  clientToken?: string;

  @IsString()
  @IsOptional()
  storeSettings?: string;

  @IsBoolean()
  @IsOptional()
  processInitiated?: boolean;

  @IsOptional()
  @IsString()
  agent?: string;
}
