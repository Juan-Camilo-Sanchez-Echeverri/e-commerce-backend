import { IsNotBlank } from '../decorators';

export class Address {
  @IsNotBlank({ message: 'country is required and is a string' })
  country: string;

  @IsNotBlank({ message: 'state is required and is a string' })
  state: string;

  @IsNotBlank({ message: 'address is required and is a string' })
  city: string;
}
