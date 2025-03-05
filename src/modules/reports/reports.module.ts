import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { CategoriesModule } from '../categories/categories.module';

import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';

import { StoreCustomerModule } from '../customers/store-customer.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    StoreCustomerModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
