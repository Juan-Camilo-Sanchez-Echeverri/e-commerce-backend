import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema({ _id: false })
export class ShippingAddress {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'State',
    required: true,
    autopopulate: { select: 'name' },
  })
  state: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City',
    required: true,
    autopopulate: { select: 'name' },
  })
  city: Types.ObjectId;

  @Prop({ required: true })
  address: string;

  @Prop()
  additionalDetails: string;

  @Prop({ required: true })
  phone: string;
}

export const ShippingAddressSchema =
  SchemaFactory.createForClass(ShippingAddress);
