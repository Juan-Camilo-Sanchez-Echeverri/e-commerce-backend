import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SalesStatus } from '@common/enums';

import { GatewayName } from '@modules/payments/enums';

import { CreateOrderDto } from '@modules/orders/dto';

import { paymentGatewayFactory } from '@modules/payments/factories/payment-gateway.factory';

import { CouponsService } from '@modules/coupons/coupons.service';
import { ProductsService } from '@modules/products/products.service';
import { StoreCustomerService } from '@modules/customers/store-customer.service';

import { OrdersService } from '@modules/orders/orders.service';
import { UsersService } from '@modules/users/users.service';
import { PaymentsService } from '@modules/payments/payments.service';
import { CouponRulesService } from '@modules/coupon-rules/coupon-rules.service';
import { StoreConfigService } from '@modules/store-config/store-config.service';

import {
  ShoppingCart,
  ShoppingCartDocument,
} from './schemas/shopping-cart.schema';

import {
  AttributesInfo,
  CreateShoppingCartDto,
  PayShoppingCartDto,
  ProductInfo,
  UpdateShoppingCartDto,
} from './dto';
import { CouponDocument } from '../coupons/schemas/coupon.schema';

// TODO: REFACTOR THIS SERVICE

@Injectable()
export class ShoppingCartService {
  constructor(
    @InjectModel(ShoppingCart.name)
    private readonly shoppingCartModel: Model<ShoppingCart>,
    private readonly couponsService: CouponsService,
    private readonly productService: ProductsService,
    private readonly storeCustomerService: StoreCustomerService,

    private readonly ordersService: OrdersService,
    private readonly jwtService: JwtService,
    private readonly paymentsService: PaymentsService,
    private readonly couponRulesService: CouponRulesService,
    private readonly storeConfigService: StoreConfigService,
  ) {}

  async findOne(id: string) {
    return this.shoppingCartModel.findById(id);
  }

  async create(createShoppingCartDto: CreateShoppingCartDto) {
    const { products } = createShoppingCartDto;
    await this.checkInsufficientStock(products);
    this.checkDuplicateProducts(products);

    const { totalItems, totalProducts, totalCart } =
      await this.calculateCartTotals(products);

    await this.updateStock(products);

    const createdCart = await this.shoppingCartModel.create({
      ...createShoppingCartDto,
      totalItems,
      totalProducts,
      totalCart,
    });

    return await this.shoppingCartModel
      .findById(createdCart._id)
      .populate('products.product', 'name price')
      .populate('products.attributes.attribute', 'name');
  }

  async addProduct(id: string, product: ProductInfo) {
    const cartExists = await this.shoppingCartModel.findById(id);
    const { products } = cartExists!;

    let productFound = false;

    await Promise.all(
      products.map(async (item) => {
        const productExist = {
          product: String(item.product),
          attributes: item.attributes,
          quantity: item.quantity,
        };

        const attributesMatch = this.isEqualAttributes(
          product.attributes!,
          productExist.attributes!,
        );

        if (this.areProductsEqual(product, productExist) && attributesMatch) {
          const difference = product.quantity - productExist.quantity;
          await this.updateProductStock(productExist, difference);
          item.quantity = product.quantity;
          productFound = true;
        }
      }),
    );

    if (!productFound) {
      await this.productService.removeStock(product.product, product.quantity);
      products.push(product);
    }

    const cartTotals = await this.calculateCartTotals(products);
    const updatedCart = await this.updateShoppingCart(id, products, cartTotals);

    return updatedCart;
  }

  async removeProduct(id: string, productInfo: ProductInfo) {
    const cartExists = await this.shoppingCartModel.findById(id);
    const { products } = cartExists!;

    const productIndex = products.findIndex((item) => {
      const productExist = {
        product: String(item.product),
        attributes: item.attributes,
        quantity: item.quantity,
      };
      const attributesMatch = this.isEqualAttributes(
        productInfo.attributes!,
        productExist.attributes!,
      );
      return productInfo.product === productExist.product && attributesMatch;
    });

    if (productIndex === -1) {
      throw new BadRequestException('Producto no encontrado en el carro');
    }

    const product = products[productIndex];
    products.splice(productIndex, 1);
    await this.productService.addStock(product.product, product.quantity);

    const { totalItems, totalProducts, totalCart } =
      await this.calculateCartTotals(products);

    const updatedCart = await this.shoppingCartModel
      .findByIdAndUpdate(
        id,
        {
          $set: { products },
          totalCart,
          totalItems,
          totalProducts,
        },
        { new: true },
      )
      .populate('products.product', 'name price')
      .populate('products.attributes.attribute', 'name');

    if (updatedCart!.products.length === 0)
      await this.shoppingCartModel.findByIdAndDelete(id);

    return updatedCart;
  }

  async pay(id: string, payShoppingCartDto: PayShoppingCartDto) {
    const cartExists = await this.shoppingCartModel.findById(id);

    const { clientToken, processInitiated, referencePay } = payShoppingCartDto;

    if (processInitiated) {
      return await this.shoppingCartModel.findByIdAndUpdate(
        id,
        { processInitiated },
        { new: true },
      );
    }

    if (cartExists!.processInitiated && clientToken) {
      return await this.handleProcessInitiated(cartExists!, clientToken);
    }

    const conditionValidPayment =
      cartExists!.processInitiated && cartExists!.client && referencePay;

    if (conditionValidPayment) {
      return await this.handleValidPayment(cartExists!, referencePay);
    }

    const updatedCart = await this.shoppingCartModel
      .findByIdAndUpdate(id, payShoppingCartDto, { new: true })
      .populate('products.product', 'name price')
      .populate('products.attributes.attribute', 'name');

    return updatedCart;
  }

  private async handleProcessInitiated(
    cartExists: ShoppingCartDocument,
    clientToken: string,
  ) {
    const payload = await this.verifyClientAndGetPayload(clientToken);
    const { sub } = payload;
    await this.storeCustomerService.findById(sub);

    const config = await this.storeConfigService.getSettingsByStoreId();

    let settings;

    if (config!.gatewayName === GatewayName.ePayco) {
      settings = await this.paymentsService.ePaycoSetting();
    }

    if (config!.gatewayName === GatewayName.PayU) {
      settings = await this.paymentsService.payUSettings(
        cartExists.totalCart,
        'COP',
      );
    }

    await this.shoppingCartModel.findByIdAndUpdate(cartExists._id, {
      client: sub,
    });

    return {
      settingsPayment: {
        ...settings,
        // TODO : PONER EL NOMBRE DE LA TIENDA DE LA CONFIGURACION DE LA PLATAFORMA
        description: `Compra`,
        currency: 'COP',
        country: 'co',
      },
    };
  }

  private async handleValidPayment(
    cartExists: ShoppingCartDocument,
    referencePay: string,
  ) {
    const payShoppingCartDto = await this.endOfSale(
      cartExists,
      cartExists.client,
      referencePay,
    );

    await this.shoppingCartModel.findByIdAndDelete(cartExists._id);

    if (!payShoppingCartDto) {
      throw new BadRequestException(payShoppingCartDto);
    }

    return payShoppingCartDto;
  }

  async update(id: string, updateShoppingCartDto: UpdateShoppingCartDto) {
    try {
      const cartExists = await this.shoppingCartModel.findById(id);

      const { coupon } = updateShoppingCartDto;

      if (coupon && cartExists!.coupon) {
        throw new BadRequestException('El carro ya tiene un cupón aplicado');
      }

      if (coupon) await this.applyCoupon(cartExists!, coupon);

      return await this.shoppingCartModel
        .findByIdAndUpdate(id, updateShoppingCartDto, { new: true })
        .populate('products.product', 'name price')
        .populate('products.attributes.attribute', 'name');
    } catch (error) {
      const populatedCart = await this.shoppingCartModel
        .findById(id)
        .populate('products.product', 'name price')
        .populate('products.attributes.attribute', 'name');
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
          cart: populatedCart ? populatedCart : undefined,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async updateProductStock(
    product: ProductInfo,
    difference: number,
  ): Promise<void> {
    if (difference > 0) {
      const infoProduct = await this.productService.findOneByQuery({
        _id: product.product,
      });

      const totalQuantity = product.quantity + difference;
      const totalStockProduct = infoProduct!.stock + product.quantity;
      if (product.quantity > infoProduct!.stockInitial) {
        throw new BadRequestException('No hay suficiente stock');
      }

      if (totalQuantity > totalStockProduct) {
        throw new BadRequestException('No hay suficiente stock');
      }

      await this.productService.removeStock(
        product.product,
        Math.abs(difference),
      );
    } else {
      await this.productService.addStock(product.product, Math.abs(difference));
    }
  }

  private async updateShoppingCart(
    id: string,
    products: ProductInfo[],
    cartTotals: InfoTotalCart,
  ) {
    const { totalItems, totalProducts, totalCart } = cartTotals;

    return await this.shoppingCartModel
      .findByIdAndUpdate(
        id,
        {
          $set: { products },
          totalCart,
          totalItems,
          totalProducts,
        },
        { new: true },
      )
      .populate('products.product', 'name price')
      .populate('products.attributes.attribute', 'name');
  }

  private areProductsEqual(
    productA: ProductInfo,
    productB: ProductInfo,
  ): boolean {
    return productA.product === productB.product;
  }

  private isEqualAttributes(
    attributes1: AttributesInfo[],
    attributes2: AttributesInfo[],
  ): boolean {
    const sortedAttributes1 = attributes1.map((attr) => ({
      attribute: attr.attribute.toString(),
      value: attr.value,
    }));
    const sortedAttributes2 = attributes2.map((attr) => ({
      attribute: attr.attribute.toString(),
      value: attr.value,
    }));

    return (
      JSON.stringify(sortedAttributes1) === JSON.stringify(sortedAttributes2)
    );
  }

  private checkDuplicateProducts(products: ProductInfo[]): void {
    const uniqueProducts = new Set<string>();

    for (const product of products) {
      const productKey = JSON.stringify({
        id: product.product,
        attributes: product.attributes,
        quantity: product.quantity,
      });

      if (uniqueProducts.has(productKey)) {
        throw new BadRequestException(
          `Producto duplicado: ${JSON.stringify(product)}`,
        );
      }

      uniqueProducts.add(productKey);
    }
  }

  private async calculateCartTotals(
    products: ProductInfo[],
  ): Promise<InfoTotalCart> {
    let totalProducts = 0;
    let totalItems = 0;
    let totalCart = 0;

    for (const product of products) {
      const productExists = await this.productService.findOneByQuery({
        _id: product.product,
      });

      if (productExists) {
        totalProducts += 1;
        totalItems += product.quantity;
        product.totalProduct = product.quantity * productExists.price;
        totalCart += product.totalProduct;
      }
    }

    return {
      totalProducts,
      totalItems,
      totalCart,
    };
  }

  private async checkInsufficientStock(products: ProductInfo[]): Promise<void> {
    const productsWithInsufficientStock: string[] = [];
    for (const product of products) {
      const productExists = await this.productService.findOneByQuery({
        _id: product.product,
      });

      if (productExists!.stock < product.quantity) {
        productsWithInsufficientStock.push(productExists!.name);
      }
    }

    if (productsWithInsufficientStock.length > 0) {
      const errorMessage = `Productos que no tienen stock suficiente: ${productsWithInsufficientStock.join(
        ', ',
      )}`;
      throw new BadRequestException(errorMessage);
    }
  }

  private async updateStock(products: ProductInfo[]): Promise<void> {
    for (const product of products) {
      const productExists = await this.productService.findOneByQuery({
        _id: product.product,
      });

      if (productExists!.stock >= product.quantity)
        await this.productService.removeStock(
          product.product,
          product.quantity,
        );
    }
  }

  private async verifyClientAndGetPayload(client: string): Promise<any> {
    return await this.jwtService.verifyAsync(client, {
      secret: process.env.JWT_SECRET as string,
      ignoreExpiration: true,
    });
  }

  private async applyCoupon(
    cart: ShoppingCartDocument,
    couponCode: string,
  ): Promise<void> {
    const coupon = await this.couponsService.findByCode(couponCode);
    if (!coupon || !coupon.isActive)
      throw new BadRequestException('Cupón no válido');

    const { discount } = coupon;
    let discountAmount = 0;

    discountAmount += await this.calculateDiscountAmount(
      coupon,
      cart,
      discount,
    );

    await this.couponsService.updateUsedCoupon(String(coupon._id));

    const updatedTotalCart = cart.totalCart - discountAmount;

    await this.shoppingCartModel.findByIdAndUpdate(cart._id, {
      $set: { products: cart.products, totalCart: updatedTotalCart },
    });
  }

  private async calculateDiscountAmount(
    coupon: CouponDocument,
    cart: ShoppingCartDocument,
    discount: number,
  ): Promise<number> {
    let discountAmount = 0;

    if (coupon.byProduct) {
      const productId = coupon.byProduct;
      const product = cart.products.find(
        (item): boolean => String(item['product']) === String(productId),
      );
      if (product) {
        discountAmount += await this.couponRulesService.applyDiscountToProduct(
          product,
          discount,
        );
      }
    }

    return discountAmount;
  }

  private async endOfSale(
    cart: ShoppingCartDocument,
    storeCostumer: string,
    referencePay?: string,
  ) {
    const config = await this.storeConfigService.getSettingsByStoreId();

    const createOrder = {
      products: cart.products as ProductInfo[],
      client: storeCostumer,

      totalProducts: cart.totalProducts,
      totalItems: cart.totalItems,
      totalCart: cart.totalCart,
      processStatus: SalesStatus.PENDING,
      referencePay,
      coupon: cart?.coupon,
    };
    return await this.createOrder(
      createOrder as CreateOrderDto,
      cart,
      storeCostumer,
      config!.gatewayName,
    );
  }

  private async createOrder(
    createOrder: CreateOrderDto,
    cartExists: ShoppingCartDocument,
    client: string,
    gatewayName: GatewayName,
  ) {
    const paymentGateway =
      gatewayName === GatewayName.ePayco
        ? paymentGatewayFactory.getInstance(GatewayName.ePayco)
        : paymentGatewayFactory.getInstance(GatewayName.PayU);

    const orderCreate = await this.ordersService.create(createOrder);
    const config = await this.storeConfigService.getSettingsByStoreId();

    const resultPay = await this.paymentsService.pay(
      { ...createOrder, configStore: config },
      gatewayName,
      paymentGateway,
    );

    if (resultPay) {
      await this.ordersService.updateStatus(
        String(orderCreate._id),
        SalesStatus.APPROVED,
      );
      return { pay: true };
    } else {
      await this.ordersService.updateStatus(
        String(orderCreate._id),
        SalesStatus.REJECTED,
      );
      return { pay: false };
    }

    // return createOrder;
  }
}
