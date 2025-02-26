import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { Role, Status } from '@common/enums';
import { validateMongo } from '@common/helpers';
import { Address, AddressSchema } from '@common/schemas/address.schema';

@Schema({ timestamps: true, versionKey: false })
export class StoreCustomer {
  @Prop()
  name: string;

  @Prop()
  lastName: string;

  @Prop({ unique: true })
  email: string;

  @Prop()
  phone: string;

  @Prop()
  password: string;

  @Prop({ enum: Status, default: Status.INACTIVE })
  status: Status;

  @Prop({ default: Role.Customer })
  roles: Role[];

  @Prop({ type: AddressSchema, _id: false })
  address: Address;

  @Prop({ type: Date })
  lastLogin: Date;

  @Prop({ type: Boolean, default: true })
  notifications: boolean;
}

export type StoreCustomerDocument = HydratedDocument<StoreCustomer>;
export const StoreCustomerSchema = SchemaFactory.createForClass(StoreCustomer);

StoreCustomerSchema.post('save', validateMongo);
StoreCustomerSchema.post('findOneAndUpdate', validateMongo);
