import { Controller, Get, Query } from '@nestjs/common';

import { Public } from '@common/decorators';

import { FilterCitiesDto } from './dto';
import { FilterCitiesPipe } from './pipes/filter-cities.pipe';

import { CitiesService } from './cities.service';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Public()
  @Get()
  async findByState(@Query(FilterCitiesPipe) query: FilterCitiesDto) {
    return await this.citiesService.findPaginate(query);
  }
}
