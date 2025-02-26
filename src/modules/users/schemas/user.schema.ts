import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import  { HydratedDocument } from 'mongoose';

import { validateMongo } from '@common/helpers';
import { Role, Status } from '@common/enums';

@Schema({ timestamps: true, versionKey: false })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop()
  password: string;

  @Prop({ enum: Status })
  status: Status;

  @Prop()
  roles: Role[];

  @Prop({ type: Date })
  lastLogin: Date;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.post('save', validateMongo);
UserSchema.post('findOneAndUpdate', validateMongo);
