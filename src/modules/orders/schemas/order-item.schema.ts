import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ _id: false })
export class OrderItem {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  })
  product: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  variant: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  color: string;

  @Prop({ required: true })
  size: string;

  @Prop({ required: true })
  price: number;

  @Prop({ type: Object, required: false })
  offerInfo?: {
    hasOffer: boolean;
    originalPrice?: number;
    offerPrice?: number;
    discount?: number;
  };
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
