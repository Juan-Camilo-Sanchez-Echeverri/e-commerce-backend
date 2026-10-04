import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { BaseSchema } from '@common/database';

@Schema({ timestamps: true })
export class Favorite extends BaseSchema {
  @Prop({
    required: true,
    index: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  user: string;

  @Prop({
    required: true,
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  })
  products: string[];
}

export type FavoriteDocument = HydratedDocument<Favorite>;
export const FavoriteSchema = SchemaFactory.createForClass(Favorite);
