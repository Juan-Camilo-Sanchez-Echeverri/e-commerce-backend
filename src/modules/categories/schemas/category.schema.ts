import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

import { Status } from '@common/enums';

import { BaseSchema } from '@common/database';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true, versionKey: false })
export class Category extends BaseSchema {
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
  subcategories?: Types.ObjectId[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);
