import { BadRequestException, HttpException } from '@nestjs/common';

interface DataValidateEpayco {
  ref_epayco: string;
  price?: number;
  totalCart?: number;
}

export const validateEpayco = async (data: DataValidateEpayco) => {
  const { ref_epayco } = data;

  const price = data.price || data.totalCart;

  try {
    const response = await fetch(
      `https://secure.epayco.co/validation/v1/reference/${ref_epayco}`,
    );

    const dataPay = await response.json();

    validatePrice(dataPay, price!);

    const paymentStatus = dataPay.data['x_cod_transaction_state'];
    switch (paymentStatus) {
      case 1:
        return true;
      case 2:
        return false;
      case 3:
        return false;
      default:
        throw new BadRequestException('Estado de pago desconocido');
    }
  } catch (error) {
    throw new HttpException(error.message, error.status);
  }
};

const validatePrice = (dataPay: any, price: number) => {
  const pricePay = dataPay.data['x_amount'];

  if (pricePay && pricePay !== price) {
    throw new BadRequestException('El precio no coincide');
  }
};
