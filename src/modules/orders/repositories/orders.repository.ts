import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { EntityRepository } from '@common/database/entity.repository';

import { Order } from '../schemas/order.schema';

@Injectable()
export class OrdersRepository extends EntityRepository<Order> {
  constructor(@InjectModel(Order.name) model: Model<Order>) {
    super(model);
  }
}
