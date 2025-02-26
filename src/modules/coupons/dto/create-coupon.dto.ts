import {
  IsArray,
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { IsNotBlank } from '@common/decorators';

export class CreateCouponDto {
  @IsNotBlank({ message: 'The label cannot be empty.' })
  label: string;

  @IsString()
  @IsOptional()
  @MaxLength(6)
  code?: string;

  @IsOptional()
  @IsArray()
  byCategories?: string[];

  @IsOptional()
  @IsNumber()
  byMinAmount?: number;

  @IsOptional()
  @IsString()
  byProduct?: string;

  @IsOptional()
  @IsNumber()
  byMinProductQuantity?: number;

  @IsOptional()
  @IsArray()
  byCategoryPair?: string[];

  @IsNumber()
  @Min(1)
  @Max(100)
  discount: number;

  @IsOptional()
  @IsArray()
  usedBy?: string[];

  @IsDate()
  startDate: Date;

  @IsDate()
  expirationDate: Date;

  @IsInt()
  @IsPositive()
  limit: number;
}
