import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { EntityRepository } from '@common/database/entity.repository';

import { StoreCustomer } from '../schemas/store-customer.schema';

@Injectable()
export class StoreCustomerRepository extends EntityRepository<StoreCustomer> {
  constructor(@InjectModel(StoreCustomer.name) model: Model<StoreCustomer>) {
    super(model);
  }
}
