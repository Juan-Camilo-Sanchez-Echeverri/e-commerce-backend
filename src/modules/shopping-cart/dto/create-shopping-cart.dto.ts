import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ProductInfo } from './product-info.dto';

export class CreateShoppingCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductInfo)
  products: ProductInfo[];

  @IsNumber()
  @IsOptional()
  totalProducts?: number;

  @IsNumber()
  @IsOptional()
  totalItems?: number;

  @IsNumber()
  @IsOptional()
  totalCart?: number;

  @IsString()
  @IsOptional()
  coupon?: string;
}
