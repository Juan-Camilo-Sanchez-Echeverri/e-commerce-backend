import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { validateMongo } from '@common/helpers/mongo.helpers';
import { BaseSchema } from '@common/database';

@Schema({ timestamps: true })
export class City extends BaseSchema {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'State', index: true })
  state: Types.ObjectId;

  @Prop({ required: true, index: true })
  code: string;

  @Prop({ required: true })
  name: string;
}

export type CityDocument = HydratedDocument<City>;
export const CitySchema = SchemaFactory.createForClass(City);

CitySchema.post('save', validateMongo);
