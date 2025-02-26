import { BadRequestException } from '@nestjs/common';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { validateMongo } from '../../../common/helpers';
import { StateDocument } from '../../states/schemas/state.schema';

@Schema({ timestamps: true })
export class City {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'State', index: true })
  state: StateDocument;

  @Prop({ required: true, index: true })
  code: string;

  @Prop({ required: true })
  name: string;
}

export type CityDocument = HydratedDocument<City>;
export const CitySchema = SchemaFactory.createForClass(City);

CitySchema.post('save', validateMongo);
