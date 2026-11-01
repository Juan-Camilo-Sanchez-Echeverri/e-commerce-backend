import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { EntityRepository } from '@common/database/entity.repository';

import { Offer } from '../schemas/offer.schema';

@Injectable()
export class OffersRepository extends EntityRepository<Offer> {
  constructor(@InjectModel(Offer.name) model: Model<Offer>) {
    super(model);
  }
}
