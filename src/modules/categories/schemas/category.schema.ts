import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

import { Status } from '@common/enums';

import { Subcategory } from '../../subcategories/schemas/subcategory.schema';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true, versionKey: false })
export class Category extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  icon: string;

  @Prop({ enum: Status, default: Status.ACTIVE })
  status?: Status;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' }],
  })
  subcategories?: Subcategory[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);
