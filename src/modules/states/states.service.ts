import { PaginateResult } from '@common/database';

import { Injectable, NotFoundException } from '@nestjs/common';

import { FilterDto } from '@common/dto';

import { CreateStateDto } from './dto';
import { STATE_NOT_FOUND } from './constants/states.constants';

import { StatesRepository } from './repositories/states.repository';
import { State, StateDocument } from './schemas/state.schema';

@Injectable()
export class StatesService {
  constructor(private readonly statesRepository: StatesRepository) {}

  async create(createStateDto: CreateStateDto): Promise<StateDocument> {
    return await this.statesRepository.create(createStateDto);
  }

  async findPaginate(
    query: FilterDto<State>,
  ): Promise<PaginateResult<StateDocument>> {
    return await this.statesRepository.findPaginate(query, {
      sort: { name: 1 },
    });
  }

  async findOneById(id: string): Promise<StateDocument> {
    const state = await this.statesRepository.findOneById(id);

    if (!state) throw new NotFoundException(STATE_NOT_FOUND);

    return state;
  }
}
