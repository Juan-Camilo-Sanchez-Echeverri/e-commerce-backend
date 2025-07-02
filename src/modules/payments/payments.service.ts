import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { EventEmitter2 } from '@nestjs/event-emitter';

import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { PreferenceResponse } from 'mercadopago/dist/clients/preference/commonTypes';
import { envs } from '../config';
import { Items } from 'mercadopago/dist/clients/commonTypes';

@Injectable()
export class PaymentsService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  private readonly client = new MercadoPagoConfig({
    accessToken: envs.mercadoPagoAccessToken,
    options: { timeout: 5000 },
  });

  private readonly preference = new Preference(this.client);
  private readonly payment = new Payment(this.client);

  async create(itemsToSale: Items[], orderId: string) {
    const result: PreferenceResponse = await this.preference.create({
      body: {
        items: itemsToSale,
        external_reference: orderId,
        notification_url: envs.mercadoPagoUrlWebhook,
        expires: true,
      },
      requestOptions: { timeout: 5000 },
    });

    if (!result.init_point) {
      throw new InternalServerErrorException(
        'Failed to create Mercado Pago preference',
      );
    }

    return result.init_point;
  }

  async handleWebhook(data: { resource: string; topic: string }) {
    if (data.topic === 'payment') {
      const paymentId = data.resource;
      const paymentDetails = await this.payment.get({ id: paymentId });

      await this.eventEmitter.emitAsync('payment.completed', paymentDetails);
    }
  }
}
