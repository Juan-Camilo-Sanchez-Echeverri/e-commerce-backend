import { IsOptional, IsDate, IsNumber, Min, Max } from 'class-validator';

import { IsNotBlank } from '@common/decorators';

export class CreateOfferDto {
  @IsNotBlank({ message: 'The label cannot be empty.' })
  label: string;

  @IsNotBlank({ message: 'The description cannot be empty.' })
  description: string;

  image: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  discountPercentage?: number;

  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @IsNotBlank({ message: 'The byProduct cannot be empty.' })
  byProduct: string;

  @IsDate()
  startDate: Date;

  @IsDate()
  expirationDate: Date;
}
