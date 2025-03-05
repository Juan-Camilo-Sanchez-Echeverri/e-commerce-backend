import {
  IsMongoId,
  IsArray,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

import { IsNotBlank } from '@common/decorators';
import { Status } from '@common/enums';

export class CreateProductDto {
  @IsNotBlank({ message: 'name should not be empty' })
  name: string;

  @IsNotBlank({ message: 'description should not be empty' })
  description: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsArray()
  @IsMongoId({ each: true })
  categories: string[];

  @IsArray()
  @IsMongoId({ each: true })
  subcategories: string[];
}
