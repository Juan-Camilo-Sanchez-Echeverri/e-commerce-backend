import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, PaginateResult } from 'mongoose';

import { FilterDto } from '@common/dto';

import { CreateStateDto } from './dto';
import { STATE_NOT_FOUND } from './constants/states.constants';

import { State, StateDocument } from './schemas/state.schema';

@Injectable()
export class StatesService {
  constructor(
    @InjectModel(State.name) private stateModel: PaginateModel<State>,
  ) {}

  async create(createStateDto: CreateStateDto): Promise<StateDocument> {
    return await this.stateModel.create(createStateDto);
  }

  async findPaginate(
    query: FilterDto<StateDocument>,
  ): Promise<PaginateResult<StateDocument>> {
    const { data, limit, page } = query;

    return await this.stateModel.paginate(data, {
      limit,
      page,
      sort: { name: 1 },
    });
  }

  async findOneById(id: string): Promise<StateDocument> {
    const state = await this.stateModel.findById(id);
    if (!state) throw new NotFoundException(STATE_NOT_FOUND);

    return state;
  }
}
