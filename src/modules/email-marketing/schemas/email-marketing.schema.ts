import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class EmailMarketing {
  @Prop()
  subject: string;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'StoreCustomer',
  })
  usersSent: string[];

  @Prop()
  content: string;

  @Prop({ default: false })
  isSent: boolean;

  @Prop({ type: Date })
  sendDate: Date;
}

export type EmailMarketingDocument = HydratedDocument<EmailMarketing>;
export const EmailMarketingSchema =
  SchemaFactory.createForClass(EmailMarketing);
