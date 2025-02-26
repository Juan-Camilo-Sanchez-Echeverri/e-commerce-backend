import {
  IsArray,
  ValidateNested,
  IsMongoId,
  IsNumber,
  IsEnum,
  IsString,
  IsOptional,
} from 'class-validator';
import { ProductInfo } from '../../shopping-cart/dto/product-info.dto';
import { Type } from 'class-transformer';
import { SalesStatus } from '../../../common/enums/sales-status.enum';
export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductInfo)
  products: ProductInfo[];

  @IsMongoId()
  client: string;

  @IsMongoId()
  agent: string;

  @IsNumber()
  totalProducts: number;

  @IsNumber()
  totalItems: number;

  @IsNumber()
  totalCart: number;

  @IsEnum(SalesStatus)
  processStatus: SalesStatus;

  @IsString()
  @IsOptional()
  coupon?: string;

  @IsString()
  @IsOptional()
  referencePay?: string;
}
