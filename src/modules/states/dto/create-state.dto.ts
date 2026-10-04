import { IsNotBlank } from '@common/decorators';

export class CreateStateDto {
  @IsNotBlank({ message: 'code is required and is a string' })
  code: string;

  @IsNotBlank({ message: 'name is required and is a string' })
  name: string;
}
