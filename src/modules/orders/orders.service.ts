import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { OnEvent } from '@nestjs/event-emitter';

import { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';

import { ProductsService } from '@modules/products/products.service';
import { PaymentsService } from '@modules/payments/payments.service';

import { CreateOrderDto, UpdateOrderDto } from './dto';

import { Order, OrderDocument } from './schemas/order.schema';
import { OrderStatus } from './schemas';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,

    private readonly productsService: ProductsService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderDocument> {
    const items = await Promise.all(
      createOrderDto.items.map(async (item) => {
        const product = await this.productsService.findById(item.productId);
        const variant = this.productsService.getVariant(
          product,
          item.variantId,
        );

        variant.sizesStock.forEach((sizeStock) => {
          if (sizeStock.size !== item.size) {
            throw new NotFoundException(
              `Size ${item.size} not found for product ${product.name}`,
            );
          }
          if (sizeStock.stock < item.quantity) {
            throw new NotFoundException(
              `Not enough stock for product ${product.name}, size ${item.size}`,
            );
          }
        });

        const priceInOffer = await this.productsService.getPrice(product);
        const price = priceInOffer !== null ? priceInOffer : product.price;

        return {
          product,
          variant,
          price,
          quantity: item.quantity,
          size: item.size,
        };
      }),
    );

    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const orderNew = await this.orderModel.create({
      ...createOrderDto,
      items,
      total,
      status: 'PENDING',
    });

    const paymentUrl = await this.paymentsService.create(
      items.map((item) => ({
        id: item.product._id.toString(),
        title: item.product.name,
        quantity: item.quantity,
        unit_price: item.price,
      })),
      orderNew._id.toString(),
    );

    orderNew.paymentUrl = paymentUrl;
    await orderNew.save();

    return this.populateOrder(orderNew);
  }

  async findAll(): Promise<OrderDocument[]> {
    return this.orderModel.find().populate('items.product', 'name').exec();
  }

  async findOne(id: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id);

    if (!order) throw new NotFoundException(`Order not found`);

    return this.populateOrder(order);
  }

  async findByEmail(email: string): Promise<OrderDocument[]> {
    return this.orderModel.find({ email }).populate('items.product').exec();
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<OrderDocument> {
    const orderUpdate = await this.orderModel.findByIdAndUpdate(
      id,
      updateOrderDto,
      { new: true },
    );

    if (!orderUpdate) throw new NotFoundException(`Order not found`);

    return this.populateOrder(orderUpdate);
  }

  async remove(id: string): Promise<OrderDocument> {
    const order = await this.orderModel.findByIdAndDelete(id);

    if (!order) throw new NotFoundException(`Order not found`);

    return order;
  }

  private populateOrder(order: OrderDocument): Promise<OrderDocument> {
    return order.populate('items.product', 'name price');
  }

  @OnEvent('payment.completed', { async: true })
  async handlePaymentCompletedEvent(payload: PaymentResponse) {
    const order = await this.orderModel.findOne({
      _id: payload.external_reference,
    });

    if (!order) {
      console.error(`Order with Id ${payload.external_reference} not found`);
      return;
    }

    if (payload.status === 'approved') {
      order.status = OrderStatus.PAID;

      for (const item of order.items) {
        await this.productsService.updateStock(
          item.product,
          item.variant,
          item.size,
          -item.quantity,
        );
      }
    }

    if (payload.status === 'in_process') order.status = OrderStatus.PROCESSING;

    if (payload.status === 'rejected') order.status = OrderStatus.REJECTED;

    await order.save();
  }
}
