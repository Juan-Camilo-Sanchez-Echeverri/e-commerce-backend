import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';

import { OnEvent } from '@nestjs/event-emitter';

import { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';

import { ProductsService } from '@modules/products/products.service';
import { ProductDocument } from '@modules/products/schemas/product.schema';
import { VariantDocument } from '@modules/products/schemas/variant.schema';

import { PaymentsService } from '@modules/payments/payments.service';

import { CouponsService } from '@modules/coupons/coupons.service';
import { CouponDocument } from '@modules/coupons/schemas/coupon.schema';

import { CreateOrderDto, UpdateOrderDto } from './dto';
import { OrderItemDto } from './dto/order-item.dto';

import { Order, OrderDocument } from './schemas/order.schema';
import { OrderStatus } from './schemas';

interface ProcessedOrderItem {
  product: ProductDocument;
  variant: VariantDocument;
  price: number;
  quantity: number;
  size: string;
}

interface PaymentItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: PaginateModel<OrderDocument>,

    private readonly productsService: ProductsService,
    private readonly paymentsService: PaymentsService,
    private readonly couponsService: CouponsService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderDocument> {
    const coupon = await this.findCouponIfExists(createOrderDto.coupon);
    const items = await this.processOrderItems(createOrderDto.items);
    const total = this.calculateItemsTotal(items);
    const finalTotal = this.applyDiscount(coupon, total);

    const orderNew = await this.orderModel.create({
      ...createOrderDto,
      coupon,
      items,
      total: finalTotal,
      status: 'PENDING',
    });

    await this.setupPayment(orderNew, items);
    await this.updateCouponUsage(coupon, orderNew.email);

    return this.populateOrder(orderNew);
  }

  private async findCouponIfExists(
    couponCode?: string,
  ): Promise<CouponDocument | null> {
    return couponCode
      ? await this.couponsService.findOneByQuery({ code: couponCode })
      : null;
  }

  private async processOrderItems(
    orderItems: OrderItemDto[],
  ): Promise<ProcessedOrderItem[]> {
    return Promise.all(
      orderItems.map(async (item) => {
        const product = await this.productsService.findById(item.productId);
        const variant = this.productsService.getVariant(
          product,
          item.variantId,
        );

        this.validateStockAvailability(product, variant, item);

        const priceInOffer = await this.productsService.getPrice(product);
        const basePrice = priceInOffer !== null ? priceInOffer : product.price;

        return {
          product,
          variant,
          price: basePrice,
          quantity: item.quantity,
          size: item.size,
        };
      }),
    );
  }

  private validateStockAvailability(
    product: ProductDocument,
    variant: VariantDocument,
    item: OrderItemDto,
  ): void {
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
  }

  private calculateItemsTotal(items: ProcessedOrderItem[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  private applyDiscount(coupon: CouponDocument | null, total: number): number {
    if (!coupon) return total;

    if (coupon.byMinAmount) {
      this.couponsService.validateMinimumAmount(coupon, total);
    }

    return this.couponsService.calculateDiscountedPrice(coupon, total);
  }

  private async setupPayment(
    order: OrderDocument,
    items: ProcessedOrderItem[],
  ): Promise<void> {
    const paymentItems: PaymentItem[] = items.map((item) => ({
      id: item.product._id.toString(),
      title: item.product.name,
      quantity: item.quantity,
      unit_price: item.price,
    }));

    const paymentUrl = await this.paymentsService.create(
      paymentItems,
      order._id.toString(),
    );

    order.paymentUrl = paymentUrl;
    await order.save();
  }

  private async updateCouponUsage(
    coupon: Order['coupon'] | null,
    email: string,
  ): Promise<void> {
    if (coupon) {
      const couponId = coupon._id.toString();
      await this.couponsService.updateCouponUsage(couponId, email);
    }
  }

  private async removeCouponUsage(
    coupon: Order['coupon'] | null,
    email: string,
  ): Promise<void> {
    if (coupon) {
      const couponId = coupon._id.toString();

      await this.couponsService.removeCouponUsage(couponId, email);
    }
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

      await this.updateCouponUsage(order.coupon, order.email);
    }

    if (payload.status === 'in_process') order.status = OrderStatus.PROCESSING;

    if (payload.status === 'rejected') {
      await this.removeCouponUsage(order.coupon, order.email);
      order.status = OrderStatus.REJECTED;
    }

    await order.save();
  }
}
