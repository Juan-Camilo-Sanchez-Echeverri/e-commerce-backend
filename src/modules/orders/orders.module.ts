import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProductsModule } from '../products/products.module';
import { PaymentsModule } from '../payments/payments.module';
import { CouponsModule } from '../coupons/coupons.module';
import { StoreCustomerModule } from '../store-customers/store-customer.module';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

import { Order, OrderSchema } from './schemas/order.schema';
import { OrdersEvents } from './events/orders.events';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    ProductsModule,
    PaymentsModule,
    CouponsModule,
    StoreCustomerModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersEvents],
  exports: [OrdersService],
})
export class OrdersModule {}
