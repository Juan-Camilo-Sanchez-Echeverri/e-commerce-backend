import { Inject, Injectable, PipeTransform } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import { FilterCitiesDto } from '../dto';
import { StatesService } from '../../states/states.service';

@Injectable()
export class FilterCitiesPipe implements PipeTransform {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly statesService: StatesService,
  ) {}
  async transform(value: FilterCitiesDto): Promise<FilterCitiesDto> {
    const query = this.request.query;
    const stateId = query.state as string;

    await this.statesService.findOneById(stateId);

    value.data = { state: stateId };

    return value;
  }
}
