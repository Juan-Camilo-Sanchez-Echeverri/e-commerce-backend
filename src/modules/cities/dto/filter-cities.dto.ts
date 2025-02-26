import { IsNotBlank } from '@common/decorators';

import { FilterDto } from '@common/dto';

import { CityDocument } from '../schemas/city.schema';

export class FilterCitiesDto extends FilterDto<CityDocument> {
  @IsNotBlank({ message: 'state is required and is a string' })
  state: string;
}
