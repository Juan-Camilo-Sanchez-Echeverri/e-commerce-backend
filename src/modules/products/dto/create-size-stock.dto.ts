import { IsNotEmpty, IsNumber } from 'class-validator';

import { Type } from 'class-transformer';

import { IsNotBlank } from '@common/decorators';

export class CreateSizeStockDto {
  @IsNotBlank()
  size: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  stock: number;
}
