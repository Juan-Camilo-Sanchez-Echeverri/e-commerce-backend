import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class ProductCategory {
  @Prop()
  name: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  image?: string;
}

export type ProductCategoryDocument = HydratedDocument<ProductCategory>;
export const ProductCategorySchema =
  SchemaFactory.createForClass(ProductCategory);
