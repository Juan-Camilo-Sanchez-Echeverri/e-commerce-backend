import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { SalesStatus } from '../../../common/enums';

@Schema({ timestamps: true, versionKey: false })
export class Order {
  @Prop({
    type: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          autopopulate: { select: 'name price' },
        },
        quantity: Number,
        totalProduct: Number,
        attributes: [
          {
            attribute: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'ProductAttribute',
              autopopulate: { select: 'name' },
            },
            value: String,
          },
        ],
        _id: false,
      },
    ],
  })
  products: Array<object>;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'StoreCustomer' })
  client: string;

  @Prop()
  totalProducts: number;

  @Prop()
  totalItems: number;

  @Prop()
  totalCart: number;

  @Prop({
    enum: SalesStatus,
    default: 'pending',
  })
  processStatus: SalesStatus;

  @Prop()
  coupon?: string;

  @Prop()
  referencePay?: string;
}

export type OrderDocument = HydratedDocument<Order>;
export const OrderSchema = SchemaFactory.createForClass(Order);
