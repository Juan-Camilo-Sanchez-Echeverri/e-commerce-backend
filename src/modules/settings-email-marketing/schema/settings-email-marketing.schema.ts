import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { validateMongo } from '../../../common/helpers';

@Schema({ timestamps: true })
export class SettingsEmailMarketing {
  @Prop({ required: true })
  senderEmail: string;

  @Prop({ required: true })
  apiKey: string;
}

export type SettingsEmailMarketingDocument =
  HydratedDocument<SettingsEmailMarketing>;
export const SettingsEmailMarketingSchema = SchemaFactory.createForClass(
  SettingsEmailMarketing,
);

SettingsEmailMarketingSchema.post('save', validateMongo);
