import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';

import { Public } from '@common/decorators';
import { FilterDto } from '@common/dto';

import { StatesService } from './states.service';
import { StateDocument } from './schemas/state.schema';

@Controller('states')
@Public()
export class StatesController {
  constructor(private readonly statesService: StatesService) {}

  @Get()
  async findByQuery() {
    return await this.statesService.findPaginate({});
  }
}
