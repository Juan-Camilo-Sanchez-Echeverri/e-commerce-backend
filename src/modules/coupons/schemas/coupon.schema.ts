import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { validateMongo } from '../../../common/helpers/validate-mongo.helper';

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ index: true, required: true })
  label: string;

  @Prop({ index: true, required: true })
  code: string;

  @Prop()
  byProduct: string;

  @Prop()
  discount: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isUsed: boolean;

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        autopopulate: { select: '-__v' },
      },
    ],
  })
  usedBy?: string[];

  @Prop({ type: Date })
  startDate: Date;

  @Prop({ type: Date })
  expirationDate: Date;

  @Prop()
  limit: number;
}

export type CouponDocument = HydratedDocument<Coupon>;
export const CouponSchema = SchemaFactory.createForClass(Coupon);

CouponSchema.post('save', validateMongo);
CouponSchema.post('findOneAndUpdate', validateMongo);

function arrayLimit(val: string[]) {
  return val.length <= 2;
}

// CUPONES  POR TIEMPO SOLAMENTE USAR UNA VEZ POR USUARIO REGISTRADO (COMRADOR)
// DESCUENTO POR PORCENTAJE O PRECIO

//REGLA DE MONTO MINIMO DE COMPRA , MONTO MAXIMO DE DESCUENTO
