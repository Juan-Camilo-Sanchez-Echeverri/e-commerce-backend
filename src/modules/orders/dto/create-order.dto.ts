import {
  IsEmail,
  IsArray,
  IsOptional,
  ValidateNested,
  IsString,
  IsNotEmpty,
} from 'class-validator';

import { Type } from 'class-transformer';

import { ShippingAddressDto } from './shipping-address.dto';
import { OrderItemDto } from './order-item.dto';

export class CreateOrderDto {
  @IsEmail()
  email: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @IsString()
  @IsOptional()
  notes?: string;
}
