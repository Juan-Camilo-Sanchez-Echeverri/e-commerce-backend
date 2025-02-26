import { Module } from '@nestjs/common';
import { CouponRulesService } from './coupon-rules.service';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule],
  providers: [CouponRulesService],
  exports: [CouponRulesService],
})
export class CouponRulesModule {}
