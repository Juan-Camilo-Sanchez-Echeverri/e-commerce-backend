import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';

import { validateMongo } from '@common/helpers/mongo.helpers';
import { Role, Status } from '@common/enums';
import { BaseSchema } from '@common/database';

@Schema({ timestamps: true, versionKey: false })
export class User extends BaseSchema {
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

  @Prop({ type: Date, default: null })
  lastLogin: Date | null;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.post('save', validateMongo);
UserSchema.post('findOneAndUpdate', validateMongo);
