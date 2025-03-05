import { IsNotBlank } from '@common/decorators';

export class CreateAttributeDto {
  @IsNotBlank({ message: 'name should not be empty' })
  name: string;

  @IsNotBlank({ message: 'value should not be empty' })
  value: string;
}
