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

export class CreateCouponDto {
  @IsNotBlank({ message: 'The label cannot be empty.' })
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
  startDate: Date;

  @IsDate()
  expirationDate: Date;
}
