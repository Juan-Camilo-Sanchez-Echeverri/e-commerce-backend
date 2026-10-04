import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { EntityRepository } from '@common/database/entity.repository';

import { Coupon } from '../schemas/coupon.schema';

@Injectable()
export class CouponsRepository extends EntityRepository<Coupon> {
  constructor(@InjectModel(Coupon.name) model: Model<Coupon>) {
    super(model);
  }
}
