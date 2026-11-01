import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { EntityRepository } from '@common/database/entity.repository';

import { Subcategory } from '../schemas/subcategory.schema';

@Injectable()
export class SubcategoriesRepository extends EntityRepository<Subcategory> {
  constructor(@InjectModel(Subcategory.name) model: Model<Subcategory>) {
    super(model);
  }
}
