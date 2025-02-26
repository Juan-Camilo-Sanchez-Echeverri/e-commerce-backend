import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'ePayco' })
export class Epayco {
  @Prop()
  publicKey: string;

  @Prop()
  privateKey: string;

  @Prop()
  clientCusId?: string;
}

export type EpaycoDocument = HydratedDocument<Epayco>;
export const EpaycoSchema = SchemaFactory.createForClass(Epayco);
