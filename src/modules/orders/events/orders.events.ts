import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';

import { ProductsService } from '@modules/products/products.service';
import { OrderStatus } from '../schemas';
import { OrdersService } from '../orders.service';

@Injectable()
export class OrdersEvents {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly productsService: ProductsService,
  ) {}
  @OnEvent('payment.completed', { async: true })
  async handlePaymentCompletedEvent(payload: PaymentResponse) {
    const order = await this.ordersService.findOne(payload.external_reference!);

    if (order.status === OrderStatus.PAID) return;

    if (payload.status === 'approved') {
      order.status = OrderStatus.PAID;
      order.paymentUrl = null;

      for (const item of order.items) {
        await this.productsService.updateStock(
          item.product,
          item.variant,
          item.size,
          -item.quantity,
        );
      }

      await this.ordersService.updateCouponUsage(order.coupon, order.email);
    }

    if (payload.status === 'in_process') order.status = OrderStatus.PROCESSING;

    if (payload.status === 'rejected') {
      await this.ordersService.removeCouponUsage(order.coupon, order.email);
      order.status = OrderStatus.REJECTED;
    }

    await order.save();
  }
}
