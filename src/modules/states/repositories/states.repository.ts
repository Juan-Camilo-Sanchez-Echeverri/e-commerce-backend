import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { EntityRepository } from '@common/database/entity.repository';

import { State } from '../schemas/state.schema';

@Injectable()
export class StatesRepository extends EntityRepository<State> {
  constructor(@InjectModel(State.name) model: Model<State>) {
    super(model);
  }
}
