import { BadRequestException } from '@nestjs/common';

import { PaymentGateway } from '../../interfaces/payment-gateway.interface';
import { validateEpayco } from '../../helpers/validate-ePayco.helper';

import { XMLParser } from 'fast-xml-parser';

interface DataPay {
  referencePay: string;
  ref_epayco: string;
  configStore: any;
}

interface DataPayU {
  referencePay: string;
  configStore: {
    settingsPayU: {
      apiKey: string;
      apiLogin: string;
    };
  };
}

export class PayGateway implements PaymentGateway {
  async payEpayco(data: DataPay): Promise<boolean> {
    if (data.referencePay) {
      data.ref_epayco = data.referencePay;
    }
    return await validateEpayco(data);
  }

  // TODO : Esta en ambiente de pruebas
  async payPayU(data: DataPayU): Promise<boolean> {
    const templateBody = {
      test: true,
      language: 'es',
      command: 'ORDER_DETAIL',
      merchant: {
        apiKey: data.configStore.settingsPayU.apiKey,
        apiLogin: data.configStore.settingsPayU.apiLogin,
      },
      details: {
        orderId: data.referencePay,
      },
    };

    const response = await fetch(
      'https://sandbox.api.payulatam.com/reports-api/4.0/service.cgi',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateBody),
      },
    );

    if (response.ok) {
      const data = await response.text();
      const parser = new XMLParser();
      const dataJson = parser.parse(data);
      if (dataJson.reportingResponse.error) {
        throw new BadRequestException(dataJson.reportingResponse.error);
      }

      const statusPay =
        dataJson.reportingResponse.result.payload.transactions.transaction
          .transactionResponse.state;

      if (statusPay === 'APPROVED') return true;
    }

    return false;
  }
}
