import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { EntityRepository } from '@common/database/entity.repository';

import { City } from '../schemas/city.schema';

@Injectable()
export class CitiesRepository extends EntityRepository<City> {
  constructor(@InjectModel(City.name) model: Model<City>) {
    super(model);
  }
}
