import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Product, ProductSchema } from './schemas/product.schema';
import { ProductsController } from './controllers/products.controller';
import { ProductsService } from './products.service';
import { OffersModule } from '../offers/offers.module';
import { CategoriesModule } from '../categories/categories.module';
import { VariantsController } from './controllers/variants.controller';
import { SubcategoriesModule } from '../subcategories/subcategories.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    OffersModule,
    CategoriesModule,
    SubcategoriesModule,
  ],
  controllers: [ProductsController, VariantsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
