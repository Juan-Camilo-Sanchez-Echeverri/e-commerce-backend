import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { EntityRepository } from '@common/database/entity.repository';

import { Favorite } from '../schemas/favorite.schema';

@Injectable()
export class FavoritesRepository extends EntityRepository<Favorite> {
  constructor(@InjectModel(Favorite.name) model: Model<Favorite>) {
    super(model);
  }
}
