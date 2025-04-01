import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { Status } from '@common/enums';

@Schema({ timestamps: true })
export class Offer {
  @Prop({ index: true })
  label: string;

  @Prop({})
  description: string;

  @Prop()
  image?: string;

  @Prop()
  discountPercentage?: number;

  @Prop()
  discountAmount?: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    autopopulate: { select: 'name' },
  })
  byProduct?: string;

  @Prop({ enum: Status, default: Status.INACTIVE })
  status: Status;

  @Prop({ type: Date })
  startDate: Date;

  @Prop({ type: Date })
  expirationDate: Date;
}

export type OfferDocument = HydratedDocument<Offer>;
export const OfferSchema = SchemaFactory.createForClass(Offer);
