import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';

import { toEntity } from '@common/database';

import { ProductsService } from '@modules/products/products.service';
import { ProductDocument } from '@modules/products/schemas/product.schema';
import { VariantDocument } from '@modules/products/schemas/variant.schema';

import { PaymentsService } from '@modules/payments/payments.service';

import { CouponsService } from '@modules/coupons/coupons.service';
import { CouponDocument } from '@modules/coupons/schemas/coupon.schema';

import { StoreCustomerService } from '@modules/store-customers/store-customer.service';

import {
  CreateOrderDto,
  UpdateOrderDto,
  OrderItemDto,
  OfferInfo,
  FirstPurchaseInfo,
} from './dto';

import { OrdersRepository } from './repositories/orders.repository';
import { Order, OrderDocument, OrderItem, OrderStatus } from './schemas';

interface ProcessedOrderItem {
  product: ProductDocument;
  variant: VariantDocument;
  price: number;
  quantity: number;
  size: string;
  color: string;
  offerInfo: OfferInfo;
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
    private readonly ordersRepository: OrdersRepository,

    private readonly productsService: ProductsService,
    private readonly paymentsService: PaymentsService,
    private readonly couponsService: CouponsService,
    private readonly storeCustomerService: StoreCustomerService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderDocument> {
    const coupon = await this.findCouponIfExists(createOrderDto.coupon);
    const processedItems = await this.processOrderItems(createOrderDto.items);
    const total = this.calculateItemsTotal(processedItems);

    let finalTotal = this.applyDiscount(coupon, total);

    const isFirstPurchase = await this.isFirstPurchase(createOrderDto.email);

    if (isFirstPurchase) {
      finalTotal = this.applyFirstPurchaseDiscount(finalTotal);
    }

    const firstPurchaseDiscount: FirstPurchaseInfo = isFirstPurchase
      ? { applied: true, discount: total - finalTotal }
      : { applied: false };

    const items: OrderItem[] = processedItems.map((item) => ({
      product: item.product._id as unknown as ProductDocument,
      variant: item.variant._id.toString(),
      quantity: item.quantity,
      size: item.size,
      price: item.price,
      offerInfo: item.offerInfo,
      color: item.color,
    }));

    const trackingCode = randomBytes(6).toString('hex').toUpperCase();

    const orderNew = await this.ordersRepository.create(
      toEntity<Order>({
        ...createOrderDto,
        coupon,
        items,
        total: finalTotal,
        status: OrderStatus.PENDING,
        firstPurchaseDiscount,
        trackingCode,
      }),
    );

    await this.setupPayment(orderNew, processedItems);
    await this.updateCouponUsage(coupon, orderNew.email);

    return await this.populateOrder(orderNew);
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

        if (variant.color !== item.color) {
          throw new NotFoundException(
            `Color ${item.color} not found for product ${product.name}, size ${item.size}`,
          );
        }

        const originalPrice = product.price;
        const priceInOffer = await this.productsService.getPrice(product);
        const basePrice = priceInOffer ? priceInOffer : product.price;

        let offerInfo: OfferInfo = { hasOffer: false };

        if (priceInOffer) {
          offerInfo = {
            hasOffer: true,
            originalPrice,
            offerPrice: priceInOffer,
            discount: originalPrice - priceInOffer,
          };
        }

        return {
          product,
          variant,
          price: basePrice,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          offerInfo,
        };
      }),
    );
  }

  private validateStockAvailability(
    product: ProductDocument,
    variant: VariantDocument,
    item: OrderItemDto,
  ): void {
    const sizeStock = variant.sizesStock.find(
      (sizeStock) => sizeStock.size === item.size,
    );

    if (!sizeStock) {
      throw new NotFoundException(
        `Size ${item.size} not found for product ${product.name}`,
      );
    }

    if (sizeStock.stock < item.quantity) {
      throw new NotFoundException(
        `Not enough stock for product ${product.name}, size ${item.size}`,
      );
    }
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

  async updateCouponUsage(
    coupon: Order['coupon'] | null,
    email: string,
  ): Promise<void> {
    if (coupon) {
      const couponId = coupon._id.toString();
      await this.couponsService.updateCouponUsage(couponId, email);
    }
  }

  async removeCouponUsage(
    coupon: Order['coupon'] | null,
    email: string,
  ): Promise<void> {
    if (coupon) {
      const couponId = coupon._id.toString();

      await this.couponsService.removeCouponUsage(couponId, email);
    }
  }

  private async isFirstPurchase(email: string): Promise<boolean> {
    const customer = await this.storeCustomerService.findOneByQuery({ email });
    if (!customer) return false;

    const existingOrder = await this.ordersRepository.findOne({
      email,
      status: { $ne: OrderStatus.REJECTED },
    });

    return !existingOrder;
  }

  private applyFirstPurchaseDiscount(total: number): number {
    const FIRST_PURCHASE_DISCOUNT_PERCENT = 20;
    const discountMultiplier = (100 - FIRST_PURCHASE_DISCOUNT_PERCENT) / 100;
    return total * discountMultiplier;
  }

  async findAll(): Promise<OrderDocument[]> {
    return await this.ordersRepository.find({}, undefined, {
      populate: [{ path: 'items.product', select: 'name' }],
    });
  }

  async findOne(id: string): Promise<OrderDocument> {
    const order = await this.ordersRepository.findOneById(id);

    if (!order) throw new NotFoundException(`Order not found`);

    return this.populateOrder(order);
  }

  async findByEmail(email: string): Promise<OrderDocument[]> {
    return await this.ordersRepository.find({ email }, undefined, {
      populate: [{ path: 'items.product' }],
    });
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<OrderDocument> {
    const orderUpdate = await this.ordersRepository.findByIdAndUpdate(
      id,
      updateOrderDto,
    );

    if (!orderUpdate) throw new NotFoundException(`Order not found`);

    return this.populateOrder(orderUpdate);
  }

  async remove(id: string): Promise<OrderDocument> {
    const order = await this.ordersRepository.findByIdAndDelete(id);

    if (!order) throw new NotFoundException(`Order not found`);

    return order;
  }

  private populateOrder(order: OrderDocument): Promise<OrderDocument> {
    return order.populate('items.product', 'name price');
  }
}
