import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

import { CityDocument } from '@modules/cities/schemas/city.schema';
import { StateDocument } from '@modules/states/schemas/state.schema';

@Schema()
export class Address {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'State' })
  state: StateDocument;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'City' })
  city: CityDocument;

  @Prop()
  neighborhood: string;

  @Prop()
  shippingAddress: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
