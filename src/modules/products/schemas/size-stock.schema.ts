import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SizeStockDocument = SizeStock & Document;

@Schema()
export class SizeStock {
  @Prop({ required: true })
  size!: string;

  @Prop({ required: true })
  stock!: number;
}

export const SizeStockSchema = SchemaFactory.createForClass(SizeStock);
