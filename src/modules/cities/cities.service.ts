import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCityDto } from './dto/create-city.dto';
import { InjectModel } from '@nestjs/mongoose';
import { City, CityDocument } from './schemas/city.schema';
import { FilterQuery, PaginateModel, PaginateResult } from 'mongoose';
import { FilterDto } from '../../common/dto';
import { CITY_NOT_FOUND } from './constants/cities.constants';

@Injectable()
export class CitiesService {
  constructor(
    @InjectModel(City.name)
    private cityModel: PaginateModel<City>,
  ) {}

  async create(createMunicipalityDto: CreateCityDto): Promise<CityDocument> {
    return await this.cityModel.create(createMunicipalityDto);
  }

  async findPaginate(
    query: FilterDto<CityDocument>,
  ): Promise<PaginateResult<CityDocument>> {
    const { data, limit, page } = query;
    return await this.cityModel.paginate(data, {
      limit,
      page,
      sort: { name: 1 },
      populate: [{ path: 'state', select: 'name code' }],
    });
  }

  async findOneByQuery(
    query: FilterQuery<CityDocument>,
  ): Promise<CityDocument | undefined> {
    const city = await this.cityModel.findOne(query);
    if (city) return await this.populateCity(city);
  }

  async findOneById(id: string): Promise<CityDocument> {
    const city = await this.cityModel.findById(id);
    if (!city) throw new NotFoundException(CITY_NOT_FOUND);
    return this.populateCity(city);
  }

  private populateCity(city: CityDocument): Promise<CityDocument> {
    return city.populate([{ path: 'state', select: 'name code' }]);
  }
}
