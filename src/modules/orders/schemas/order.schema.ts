import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { Coupon, CouponDocument } from '@modules/coupons/schemas/coupon.schema';

import { OrderStatus } from '../enums/order-status.enum';

import { OrderItem, OrderItemSchema } from './order-item.schema';

import {
  ShippingAddress,
  ShippingAddressSchema,
} from './shipping-address.schema';

@Schema({ timestamps: true, versionKey: false })
export class Order {
  @Prop({ required: true })
  email: string;

  @Prop({ enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop([OrderItemSchema])
  items: OrderItem[];

  @Prop({ required: true })
  total: number;

  @Prop({ type: ShippingAddressSchema, required: true })
  shippingAddress: ShippingAddress;

  @Prop({ type: String, default: null })
  paymentUrl: string | null;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Coupon.name,
    default: null,
    autopopulate: { select: 'label code usedBy' },
  })
  coupon: CouponDocument | null;

  @Prop({ type: Object, required: false })
  firstPurchaseDiscount?: {
    applied: boolean;
    discount?: number;
  };

  @Prop()
  notes: string;
}

export type OrderDocument = HydratedDocument<Order>;
export const OrderSchema = SchemaFactory.createForClass(Order);
