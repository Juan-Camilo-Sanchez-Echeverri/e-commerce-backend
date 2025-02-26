import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class ProductAttribute {
  @Prop()
  name: string;

  @Prop()
  dataType: string;

  @Prop()
  optionValues: Array<any>;

  @Prop({ default: true })
  isActive: boolean;
}

export type ProductAttributeDocument = HydratedDocument<ProductAttribute>;
export const ProductAttributeSchema =
  SchemaFactory.createForClass(ProductAttribute);
