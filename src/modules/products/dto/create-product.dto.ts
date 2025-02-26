import { IsArray, IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

import { IsNotBlank } from '../../../common/decorators/is-not-blank.decorator';

export class CreateProductDto {
  @IsNotBlank({ message: 'name is required' })
  name: string;

  @IsNotBlank({ message: 'description is required' })
  description: string;

  @IsNumber()
  @Min(0.01)
  price: number;

  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsNumber()
  @IsOptional()
  limitWarningStock?: number;

  @IsArray()
  @IsOptional()
  images?: string[] = [];

  @IsArray()
  @IsOptional()
  categories?: string[] = [];

  @IsArray()
  @IsOptional()
  attributes?: string[] = [];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
