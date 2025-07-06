import { PartialType } from '@nestjs/mapped-types';
import { CreateStoreCustomerDto } from './create-store-customer.dto';

export class UpdateStoreCustomerDto extends PartialType(
  CreateStoreCustomerDto,
) {}
