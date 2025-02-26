import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Product, ProductSchema } from './schemas/product.schema';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { OffersModule } from '../offers/offers.module';
import { ProductAttributesModule } from '../product-attributes/product-attributes.module';
import { ProductCategoriesModule } from '../product-categories/product-categories.module';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    OffersModule,
    ProductAttributesModule,
    ProductCategoriesModule,
    S3Module,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
