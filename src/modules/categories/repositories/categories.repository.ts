import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { EntityRepository } from '@common/database/entity.repository';

import { Category } from '../schemas/category.schema';

@Injectable()
export class CategoriesRepository extends EntityRepository<Category> {
  constructor(@InjectModel(Category.name) model: Model<Category>) {
    super(model);
  }
}
