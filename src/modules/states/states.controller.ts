import { Controller, Get } from '@nestjs/common';

import { Public } from '@common/decorators';

import { StatesService } from './states.service';

@Controller('states')
@Public()
export class StatesController {
  constructor(private readonly statesService: StatesService) {}

  @Get()
  async findByQuery() {
    return await this.statesService.findPaginate({});
  }
}
