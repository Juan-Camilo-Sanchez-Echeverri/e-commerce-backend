import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class AttributesInfo {
  @IsString()
  attribute: string;

  @IsString()
  value: string;
}

export class ProductInfo {
  @IsString()
  product: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsArray()
  @IsOptional()
  attributes?: AttributesInfo[] = undefined;

  @IsOptional()
  @IsNumber()
  totalProduct?: number;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;
}
