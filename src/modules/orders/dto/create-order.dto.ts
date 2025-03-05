import {
  IsMongoId,
  IsNumber,
  IsEnum,
  IsString,
  IsOptional,
} from 'class-validator';

import { SalesStatus } from '../../../common/enums/sales-status.enum';
export class CreateOrderDto {
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
