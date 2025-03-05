import { Controller, Get, Patch, Param, Delete, Query } from '@nestjs/common';

import { Roles } from '@common/decorators';

import { FilterDto } from '@common/dto';

import { QueryFilterDto, QueryUpdateDto } from './dto';
import { OrdersService } from './orders.service';

import { OrderDocument } from './schemas/order.schema';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Roles('Supervisor')
  async findAll(@Query() query: FilterDto<OrderDocument>) {
    return await this.ordersService.findPaginate(query);
  }

  @Get(':orderId')
  @Roles('Supervisor', 'Admin')
  async findOne(@Param('orderId') orderId: string): Promise<OrderDocument> {
    return await this.ordersService.findOneById(orderId);
  }

  @Get('customer/:customerId')
  @Roles('Supervisor', 'Admin')
  async findOrdersByCustomer(
    @Param('customerId') customerId: string,
    @Query() queryFilterDto: QueryFilterDto,
  ): Promise<OrderDocument[]> {
    return await this.ordersService.findOrdersByCustomer(
      customerId,
      queryFilterDto,
    );
  }

  @Patch(':orderId')
  @Roles('Supervisor', 'Admin')
  async update(
    @Param('orderId') orderId: string,
    @Query() { status }: QueryUpdateDto,
  ): Promise<OrderDocument | null> {
    return await this.ordersService.updateStatus(orderId, status);
  }

  @Delete(':orderId')
  @Roles('Supervisor', 'Admin')
  async remove(
    @Param('orderId') orderId: string,
  ): Promise<OrderDocument | null> {
    return await this.ordersService.remove(orderId);
  }
}
