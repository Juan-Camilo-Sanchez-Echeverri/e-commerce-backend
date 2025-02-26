import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PaymentSettingsePayco, PaymentSettingsPayU } from '../../payments/dto';
import { GatewayName } from '../../payments/enums';
import { SettingsProductDto } from '../dto';

@Schema({ timestamps: true })
export class StoreConfig {
  @Prop()
  color: string;

  @Prop()
  logo: string;

  @Prop()
  cover: string;

  @Prop({ enum: GatewayName, index: true })
  gatewayName: GatewayName;

  @Prop({ type: PaymentSettingsePayco })
  settingsePayco?: PaymentSettingsePayco;

  @Prop({ type: PaymentSettingsPayU })
  settingsPayU?: PaymentSettingsPayU;

  @Prop({ type: SettingsProductDto })
  settingsProduct: SettingsProductDto;
}

export type StoreConfigDocument = HydratedDocument<StoreConfig>;

export const StoreConfigSchema = SchemaFactory.createForClass(StoreConfig);
