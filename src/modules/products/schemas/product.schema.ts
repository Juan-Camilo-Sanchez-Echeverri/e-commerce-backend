import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { StoreConfigDocument } from '../../store-config/schemas/store-config.schema';

@Schema({ timestamps: true })
export class Product {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  price: number;

  @Prop({ default: 0 })
  stock: number;

  @Prop({ default: 0 })
  stockInitial: number;

  @Prop({ default: 0 })
  limitWarningStock: number;

  @Prop()
  images: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 1 })
  qualificationsCount: number;

  @Prop({ default: 5 })
  qualificationsAverage: number;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory' }],
    set: (value: mongoose.Types.ObjectId[]) =>
      value.length > 0 ? value : undefined,
  })
  categories?: string[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProductAttribute' }],
    set: (value: mongoose.Types.ObjectId[]) =>
      value.length > 0 ? value : undefined,
  })
  attributes?: string[];
}

export type ProductDocument = HydratedDocument<Product>;
export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.pre('save', async function (next) {
  if (this.isModified('stock')) {
    this.stockInitial = this.stock;
  }

  const StoreConfigModel = this.model('StoreConfig');
  const storeConfig: StoreConfigDocument | null =
    await StoreConfigModel.findOne({});

  if (!storeConfig) return next();

  if (!this.limitWarningStock) {
    this.limitWarningStock =
      storeConfig?.settingsProduct?.limitWarningStock || 0;
  }

  if (!this.stock) {
    this.stock = storeConfig?.settingsProduct?.genericStock || 0;
    this.stockInitial = storeConfig?.settingsProduct?.genericStock || 0;
  }
  next();
});

ProductSchema.post(
  'findOneAndUpdate',
  async function (doc: ProductDocument, next) {
    if (doc.stock) {
      doc.stockInitial = doc.stock;
      await doc.save();
    }
    next();
  },
);
