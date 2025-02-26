import { NotImplementedException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

import { PaymentGateway } from './interfaces/payment-gateway.interface';
import { PaymentMethod } from './enums/payment-methods.enums';
import { StoreConfigService } from '../store-config/store-config.service';
import { GatewayName } from './enums';
import { PaymentSettingsPayU } from './dto';

import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(private readonly storeConfigService: StoreConfigService) {}

  async pay(
    data: any,
    paymentMethod: string,
    paymentGateway: PaymentGateway,
  ): Promise<boolean> {
    let result = false;

    switch (paymentMethod.toUpperCase()) {
      case PaymentMethod.Epayco:
        result = await paymentGateway.payEpayco(data);
        break;
      case PaymentMethod.PayU:
        result = await paymentGateway.payPayU(data);
        break;
      default:
        throw new NotImplementedException(
          'La pasa de pago seleccionada no está implementada',
        );
    }
    return result;
  }

  async ePaycoSetting() {
    return await this.storeConfigService.getPaymentSettings(GatewayName.ePayco);
  }

  async payUSettings(amount: number, currency: string) {
    const settings = await this.storeConfigService.getPaymentSettings(
      GatewayName.PayU,
    );

    const referenceCode = `${Math.round(new Date().getTime() + Math.random() * 100)}`;

    const payUSettings = {
      merchantId: (settings as PaymentSettingsPayU).merchantId,
      accountId: (settings as PaymentSettingsPayU).accountId,
      apiKey: (settings as PaymentSettingsPayU).apiKey,
      referenceCode: referenceCode,
      tax: '0',
      taxReturnBase: '0',
      signature: '',
      currency: currency,
      amount: amount,
    };

    const signature = this.generateSignature(payUSettings);

    payUSettings.signature = signature;

    return payUSettings;
  }

  private generateSignature(payUSettings: any) {
    const stringSignature = `${payUSettings.apiKey}~${payUSettings.merchantId}~${payUSettings.referenceCode}~${payUSettings.amount}~${payUSettings.currency}`;

    const signature = crypto
      .createHash('md5')
      .update(stringSignature)
      .digest('hex');

    return signature;
  }
}
