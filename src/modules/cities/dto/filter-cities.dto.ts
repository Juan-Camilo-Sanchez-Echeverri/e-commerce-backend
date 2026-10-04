import { IsNotBlank } from '@common/decorators';

import { FilterDto } from '@common/dto';

import { City } from '../schemas/city.schema';

export class FilterCitiesDto extends FilterDto<City> {
  @IsNotBlank({ message: 'state is required and is a string' })
  state: string;
}
