import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

import { validateMongo } from '@common/helpers/mongo.helpers';
import { Status } from '@common/enums';
import { BaseSchema } from '@common/database';

import { VariantDocument, VariantSchema } from './variant.schema';

@Schema({ timestamps: true, versionKey: false })
export class Product extends BaseSchema {
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
  categories: Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' }],
    default: [],
  })
  subcategories: Types.ObjectId[];

  @Prop([VariantSchema])
  variants: Types.DocumentArray<VariantDocument>;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

export type ProductDocument = HydratedDocument<Product>;

ProductSchema.post('save', validateMongo);

ProductSchema.index({ name: 1, status: 1 }, { unique: true });
