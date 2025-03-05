import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

import { validateMongo } from '@common/helpers';
import { Status } from '@common/enums';

import { VariantDocument, VariantSchema } from './variant.schema';
import { Category } from '../../categories/schemas/category.schema';
import { Subcategory } from '../../subcategories/schemas/subcategory.schema';

@Schema({ timestamps: true, versionKey: false })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ enum: Status, default: Status.ACTIVE })
  status: Status;

  @Prop({ required: true })
  price: number;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    default: [],
  })
  categories: Category[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' }],
    default: [],
  })
  subcategories: Subcategory[];

  @Prop([VariantSchema])
  variants: VariantDocument[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);

export type ProductVariant = {
  variants: Types.DocumentArray<VariantDocument>;
};

export type ProductDocument = HydratedDocument<Product, ProductVariant>;

ProductSchema.post('save', validateMongo);
