import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  StoreCustomer,
  StoreCustomerSchema,
} from './schemas/store-customer.schema';
import { StoreCustomerController } from './store-customer.controller';
import { StoreCustomerRepository } from './repositories/store-customer.repository';
import { StoreCustomerService } from './store-customer.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StoreCustomer.name, schema: StoreCustomerSchema },
    ]),
  ],
  controllers: [StoreCustomerController],
  providers: [StoreCustomerService, StoreCustomerRepository],
  exports: [StoreCustomerService],
})
export class StoreCustomerModule {}
