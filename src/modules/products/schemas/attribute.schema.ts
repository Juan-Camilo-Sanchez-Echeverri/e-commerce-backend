import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Attribute {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  value: string;
}

export const AttributeSchema = SchemaFactory.createForClass(Attribute);
