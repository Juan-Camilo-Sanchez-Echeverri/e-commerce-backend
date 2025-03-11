import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

import { validateMongo } from '@common/helpers/validate-mongo.helper';
import { Status } from '@common/enums';

import { ProductDocument } from '../../products/schemas/product.schema';
import { StoreCustomerDocument } from '../../customers/schemas/customer.schema';

export type PopulatedEntity<T> = Types.ObjectId | (T & { _id: Types.ObjectId });

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ index: true, required: true })
  label: string;

  @Prop({ index: true, required: true })
  code: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    autopopulate: { select: 'name' },
  })
  byProduct?: PopulatedEntity<ProductDocument>;

  @Prop()
  byMinAmount?: number;

  @Prop()
  discountPercentage?: number;

  @Prop()
  discountAmount?: number;

  @Prop({ enum: Status, default: Status.INACTIVE })
  status: Status;

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StoreCustomer',
        autopopulate: { select: '-__v' },
        default: [],
      },
    ],
  })
  usedBy: PopulatedEntity<StoreCustomerDocument>[];

  @Prop({ type: Date })
  startDate: Date;

  @Prop({ type: Date })
  expirationDate: Date;
}

export type CouponDocument = HydratedDocument<Coupon>;
export const CouponSchema = SchemaFactory.createForClass(Coupon);

CouponSchema.post('save', validateMongo);
CouponSchema.post('findOneAndUpdate', validateMongo);
