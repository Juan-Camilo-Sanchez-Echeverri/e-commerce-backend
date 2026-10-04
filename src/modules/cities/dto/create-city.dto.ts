import { IsNotBlank } from '../../../common/decorators';

export class CreateCityDto {
  @IsNotBlank({ message: 'The department is required' })
  department: any;

  @IsNotBlank({ message: 'Code is required' })
  code: string;

  @IsNotBlank({ message: 'Name is required' })
  name: string;
}
