import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { State } from '@modules/states/schemas/state.schema';
import { City } from '@modules/cities/schemas/city.schema';

@Schema({ _id: false })
export class ShippingAddress {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'State',
    required: true,
    autopopulate: { select: 'name' },
  })
  state: State;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City',
    required: true,
    autopopulate: { select: 'name' },
  })
  city: City;

  @Prop({ required: true })
  address: string;

  @Prop()
  additionalDetails: string;

  @Prop({ required: true })
  phone: string;
}

export const ShippingAddressSchema =
  SchemaFactory.createForClass(ShippingAddress);
