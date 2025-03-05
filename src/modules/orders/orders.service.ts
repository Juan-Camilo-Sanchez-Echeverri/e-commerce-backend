import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel } from 'mongoose';

import { CronExpression, Cron } from '@nestjs/schedule';

import { CreateOrderDto, QueryFilterDto } from './dto';

import { Order, OrderDocument } from './schemas/order.schema';
import { SalesStatus } from '../../common/enums/sales-status.enum';
import { ProductsService } from '../products/products.service';
import { FilterDto } from '../../common/dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: PaginateModel<Order>,
    private readonly productsService: ProductsService,
  ) {}

  async findOneById(id: string): Promise<OrderDocument> {
    const order = await this.orderModel
      .findById(id)
      .populate('products.product', 'name price stock')
      .populate('client', '-roles -__v -createdAt -updatedAt');

    if (!order) {
      throw new NotFoundException('El pedido no existe');
    }

    return order;
  }

  async findOneByQuery(
    query: FilterQuery<Order>,
  ): Promise<OrderDocument | null> {
    return await this.orderModel.findOne(query);
  }

  async findPaginate(filterDto: FilterDto<Order>) {
    const { limit, page, data } = filterDto;

    return await this.orderModel.paginate(data, {
      limit,
      page,
      populate: { path: 'client', select: 'name' },
    });
  }

  async findByQuery(query: FilterQuery<Order>): Promise<OrderDocument[]> {
    return await this.orderModel.find(query);
  }

  async create(createOrderDto: CreateOrderDto): Promise<OrderDocument> {
    return await this.orderModel.create(createOrderDto);
  }

  async findAll(): Promise<OrderDocument[]> {
    return await this.orderModel.find();
  }

  async findOrdersByCustomer(
    clientId: string,
    queryFilterDto?: QueryFilterDto,
  ) {
    const status = queryFilterDto?.status;
    const query = status
      ? { client: clientId, processStatus: status }
      : { client: clientId };

    return await this.orderModel.find(query);
  }

  async updateStatus(
    id: string,
    status: SalesStatus,
  ): Promise<OrderDocument | null> {
    const order = await this.findOneById(id);
    // if (status === SalesStatus.REJECTED || status === SalesStatus.ABANDONED) {
    //   for (const product of order.products) {
    //   }
    // }

    return this.orderModel.findByIdAndUpdate(
      id,
      { processStatus: status },
      { new: true },
    );
  }

  async remove(id: string): Promise<OrderDocument | null> {
    return this.orderModel.findByIdAndDelete(id);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateOrderStatus(): Promise<void> {
    const oneWeekAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);

    const orders = await this.orderModel.find({
      processStatus: SalesStatus.PENDING,
      createdAt: { $lt: oneWeekAgo },
    });

    for (const order of orders) {
      await this.updateStatus(String(order._id), SalesStatus.ABANDONED);
    }
  }
}
