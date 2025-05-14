import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class State {
  @Prop({ required: true, trim: true, index: true })
  code: string;

  @Prop({ required: true, trim: true, index: true })
  name: string;
}

export type StateDocument = HydratedDocument<State>;
export const StateSchema = SchemaFactory.createForClass(State);
