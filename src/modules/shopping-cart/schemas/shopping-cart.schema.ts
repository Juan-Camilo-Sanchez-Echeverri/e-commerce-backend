import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ProductInfo } from '../dto';

@Schema({ timestamps: true })
export class ShoppingCart {
  @Prop({
    type: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        quantity: Number,
        totalProduct: Number,
        attributes: {
          type: [
            {
              attribute: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'ProductAttribute',
              },
              value: String,
            },
          ],
          default: function () {
            return undefined;
          },
        },
        _id: false,
      },
    ],
  })
  products: Array<ProductInfo>;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'StoreCustomer' })
  client: string;

  @Prop()
  totalProducts: number;

  @Prop()
  totalItems: number;

  @Prop()
  totalCart: number;

  @Prop()
  coupon?: string;

  @Prop({ default: false })
  processInitiated: boolean;
}

export type ShoppingCartDocument = HydratedDocument<ShoppingCart>;
export const ShoppingCartSchema = SchemaFactory.createForClass(ShoppingCart);


// sin reserva