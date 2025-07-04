import { IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

import { IsNotBlank } from '@common/decorators';

import { CreateSizeStockDto } from './create-size-stock.dto';

export class CreateVariantDto {
  @IsNotBlank()
  color: string;

  @IsNotBlank()
  colorCode: string;

  @IsOptional()
  @IsArray()
  images: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSizeStockDto)
  sizesStock: CreateSizeStockDto[];
}
