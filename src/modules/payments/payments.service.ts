import { NotImplementedException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

import { PaymentGateway } from './interfaces/payment-gateway.interface';
import { PaymentMethod } from './enums/payment-methods.enums';

@Injectable()
export class PaymentsService {
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
}
