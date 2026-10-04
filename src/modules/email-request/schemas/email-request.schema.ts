import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

class RequestType {
  @Prop({ type: String, required: true })
  token: string;

  @Prop({ type: Date, required: true })
  expiresIn: Date;

  @Prop({ type: Number, default: 1 })
  attempts: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

@Schema({ timestamps: true, versionKey: false })
export class EmailRequest {
  @Prop({ required: true })
  email: string;

  @Prop({ type: RequestType, _id: false })
  recoverPassword?: RequestType;

  @Prop({ type: RequestType, _id: false })
  activeAccount?: RequestType;
}

export const EmailRequestSchema = SchemaFactory.createForClass(EmailRequest);
export type EmailRequestDocument = HydratedDocument<EmailRequest>;
