import { Injectable, NotFoundException } from '@nestjs/common';

import { QueryFilter } from 'mongoose';

import { PaginateResult } from '@common/database';
import { FilterDto } from '@common/dto';

import { CreateCityDto } from './dto/create-city.dto';
import { CITY_NOT_FOUND } from './constants/cities.constants';
import { CitiesRepository } from './repositories/cities.repository';
import { City, CityDocument } from './schemas/city.schema';

@Injectable()
export class CitiesService {
  constructor(private readonly citiesRepository: CitiesRepository) {}

  async create(createMunicipalityDto: CreateCityDto): Promise<CityDocument> {
    return await this.citiesRepository.create(createMunicipalityDto);
  }

  async findPaginate(
    query: FilterDto<City>,
  ): Promise<PaginateResult<CityDocument>> {
    return await this.citiesRepository.findPaginate(query, {
      sort: { name: 1 },
      populate: [{ path: 'state', select: 'name code' }],
    });
  }

  async findOneByQuery(query: QueryFilter<City>): Promise<CityDocument | null> {
    const city = await this.citiesRepository.findOne(query);

    if (city) return await this.populateCity(city);

    return null;
  }

  async findOneById(id: string): Promise<CityDocument> {
    const city = await this.citiesRepository.findOneById(id);

    if (!city) throw new NotFoundException(CITY_NOT_FOUND);

    return this.populateCity(city);
  }

  private populateCity(city: CityDocument): Promise<CityDocument> {
    return city.populate([{ path: 'state', select: 'name code' }]);
  }
}
