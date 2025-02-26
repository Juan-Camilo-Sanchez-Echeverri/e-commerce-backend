import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  ShoppingCart,
  ShoppingCartSchema,
} from './schemas/shopping-cart.schema';
import { ShoppingCartService } from './shopping-cart.service';
import { ShoppingCartController } from './shopping-cart.controller';

import { CouponsModule } from '../coupons/coupons.module';
import { StoreCustomerModule } from '../customers/store-customer.module';

import { OrdersModule } from '../orders/orders.module';
import { PaymentsModule } from '../payments/payments.module';
import { CouponRulesModule } from '../coupon-rules/coupon-rules.module';
import { ProductsModule } from '../products/products.module';
import { StoreConfigModule } from '../store-config/store-config.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShoppingCart.name, schema: ShoppingCartSchema },
    ]),
    StoreConfigModule,
    CouponsModule,

    StoreCustomerModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
    CouponRulesModule,
  ],
  controllers: [ShoppingCartController],
  providers: [ShoppingCartService],
})
export class ShoppingCartModule {}
