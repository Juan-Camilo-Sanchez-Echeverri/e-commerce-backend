import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  StoreCustomer,
  StoreCustomerSchema,
} from './schemas/store-customer.schema';
import { StoreCustomerController } from './store-customer.controller';
import { StoreCustomerService } from './store-customer.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StoreCustomer.name, schema: StoreCustomerSchema },
    ]),
  ],
  controllers: [StoreCustomerController],
  providers: [StoreCustomerService],
  exports: [StoreCustomerService],
})
export class StoreCustomerModule {}
