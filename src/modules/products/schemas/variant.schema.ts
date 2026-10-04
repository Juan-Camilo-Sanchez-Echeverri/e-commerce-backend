import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { SizeStock, SizeStockSchema } from './size-stock.schema';

export type VariantDocument = HydratedDocument<Variant>;

@Schema()
export class Variant {
  @Prop({ required: true })
  color: string;

  @Prop({ required: true })
  colorCode: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [SizeStockSchema], default: [], _id: false })
  sizesStock: SizeStock[];
}

export const VariantSchema = SchemaFactory.createForClass(Variant);
