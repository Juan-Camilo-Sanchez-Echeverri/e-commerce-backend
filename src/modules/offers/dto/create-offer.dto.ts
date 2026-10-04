import { IsOptional, IsDate, IsNumber, Min, Max, Allow } from 'class-validator';

import { IsNotBlank } from '@common/decorators';
import { Type } from 'class-transformer';

export class CreateOfferDto {
  @IsNotBlank()
  label: string;

  @IsNotBlank()
  description: string;

  @Allow()
  image: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  discountPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  discountAmount?: number;

  @IsNotBlank()
  byProduct: string;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  expirationDate: Date;
}
