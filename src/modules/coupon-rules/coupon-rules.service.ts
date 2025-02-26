import { Injectable, BadRequestException } from '@nestjs/common';
import { ShoppingCartDocument } from '../shopping-cart/schemas/shopping-cart.schema';

import { ProductsService } from '../products/products.service';
import { ProductInfo } from '../shopping-cart/dto';

@Injectable()
export class CouponRulesService {
  constructor(private readonly productService: ProductsService) {}

  async applyDiscountToProduct(
    product: any,
    discount: number,
  ): Promise<number> {
    const productInfo = await this.productService.findOne(product.product._id);
    const discountPercentage = discount / 100;
    const discountAmount = productInfo.price * discountPercentage;
    product.totalProduct -= discountAmount;
    return discountAmount;
  }

  async checkProductCategories(product1, product2, categoryPair) {
    const product1Exists = await this.productService.findOne(product1.product);
    const product2Exists = await this.productService.findOne(product2.product);

    return (
      product1Exists.categories &&
      product2Exists.categories &&
      product1Exists.categories.some((category) =>
        categoryPair.includes(category),
      ) &&
      product2Exists.categories.some((category) =>
        categoryPair.includes(category),
      )
    );
  }

  async calculateDiscountByCategories(
    cart: ShoppingCartDocument,
    discount: number,
    byCategories: string[],
  ): Promise<number> {
    let discountAmount = 0;
    const { products } = cart;
    let foundMatchingProduct = false;

    for (const product of products) {
      const { categories } = await this.productService.findOne(product.product);
      if (
        categories &&
        categories.some((category) => byCategories.includes(category))
      ) {
        discountAmount += await this.applyDiscountToProduct(product, discount);
        foundMatchingProduct = true;
      }
    }

    if (!foundMatchingProduct)
      throw new BadRequestException(
        'No encontramos productos con las categorías que corresponden al cupón',
      );
    return discountAmount;
  }

  async calculateDiscountByCategoryPair(
    cart: ShoppingCartDocument,
    discount: number,
    categoryPair: string[],
  ): Promise<number> {
    if (categoryPair.length !== 2)
      throw new BadRequestException(
        'El cupón no aplica para este carrito de compras',
      );

    let discountAmount = 0;
    let foundPair = false;

    for (let i = 0; i < cart.products.length; i++) {
      for (let j = i + 1; j < cart.products.length; j++) {
        const product1 = cart.products[i];
        const product2 = cart.products[j];

        if (
          await this.checkProductCategories(product1, product2, categoryPair)
        ) {
          discountAmount += await this.applyDiscountToProduct(
            product1,
            discount,
          );
          discountAmount += await this.applyDiscountToProduct(
            product2,
            discount,
          );

          foundPair = true;
        }
      }
    }

    if (!foundPair)
      throw new BadRequestException(
        'No encontramos productos con las categorías que corresponden al cupón',
      );
    return discountAmount;
  }

  calculateDiscountByMinProductQuantity(
    cart: ShoppingCartDocument,
    discount: number,
    byMinProductQuantity: number,
  ): number {
    const { totalItems, products } = cart;
    if (totalItems < byMinProductQuantity)
      throw new BadRequestException(
        'El cupón no aplica para este numero de productos',
      );
    return this.updatePriceProduct(products, discount);
  }

  calculateDiscountByMinAmount(
    cart: ShoppingCartDocument,
    discount: number,
    byMinAmount: number,
  ): number {
    const { totalCart, products } = cart;
    if (totalCart < byMinAmount)
      throw new BadRequestException(
        'El cupón no aplica para este valor de compra',
      );
    return this.updatePriceProduct(products, discount);
  }

  updatePriceProduct(products: ProductInfo[], discount: number): number {
    let discountAmount = 0;

    for (const product of products) {
      const productDiscount = product.totalProduct! * (discount / 100);
      product.totalProduct! -= productDiscount;
      discountAmount += productDiscount;
    }
    return discountAmount;
  }
}
