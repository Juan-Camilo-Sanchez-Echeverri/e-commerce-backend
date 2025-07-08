import { PartialType, PickType } from '@nestjs/mapped-types';

import { IsEnum, IsOptional } from 'class-validator';

import { CreateOrderDto } from './create-order.dto';
import { OrderStatus } from '../enums/order-status.enum';

export class UpdateOrderDto extends PartialType(
  PickType(CreateOrderDto, ['shippingAddress'] as const),
) {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
