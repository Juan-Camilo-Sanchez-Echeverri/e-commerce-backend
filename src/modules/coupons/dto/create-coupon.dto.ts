import {
  IsArray,
  IsDate,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { IsNotBlank } from '@common/decorators';
import { Type } from 'class-transformer';

export class CreateCouponDto {
  @IsNotBlank()
  label: string;

  @IsOptional()
  @IsString()
  @MaxLength(6)
  code?: string;

  @IsOptional()
  @IsMongoId()
  byProduct?: string;

  @IsOptional()
  @IsNumber()
  byMinAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  discountPercentage?: number;

  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @IsOptional()
  @IsArray()
  usedBy?: string[];

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  expirationDate: Date;
}
