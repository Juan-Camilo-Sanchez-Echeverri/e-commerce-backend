import { toEntity } from '@common/database';

import { Injectable, NotFoundException } from '@nestjs/common';

import { PopulateOptions, QueryFilter, UpdateQuery } from 'mongoose';

import { CreateProductDto, ParamsVariantDto, UpdateProductDto } from './dto';
import { ProductsRepository } from './repositories/products.repository';
import { Product, ProductDocument } from './schemas/product.schema';

import { FilterDto } from '@common/dto';
import { Status } from '@common/enums';

import { OffersService } from '@modules/offers/offers.service';

import { CreateVariantDto, UpdateVariantDto } from './dto';

import { PRODUCT_NOT_FOUND } from './constants/products.constants';

@Injectable()
export class ProductsService {
  private readonly pathsPopulate: PopulateOptions[] = [
    { path: 'categories', select: 'name', match: { status: Status.ACTIVE } },
    { path: 'subcategories', select: 'name', match: { status: Status.ACTIVE } },
  ];

  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly offersService: OffersService,
  ) {}

  async findPaginate(query: FilterDto<Product>) {
    return await this.productsRepository.findPaginate(query, {
      populate: this.pathsPopulate,
    });
  }

  async findPublic(query: FilterDto<Product>) {
    const products = await this.productsRepository.findPaginate(query, {
      populate: this.pathsPopulate,
    });

    const formattedProducts = products.docs.map(async (product) => {
      const priceInOffer = await this.getPrice(product);

      return { ...product.toObject(), priceInOffer };
    });

    return {
      ...products,
      docs: await Promise.all(formattedProducts),
    };
  }

  async findOneByQuery(query: QueryFilter<Product> = {}) {
    const product = await this.productsRepository.findOne(query);

    if (product) await this.populateDoc(product);

    return product;
  }

  async findById(id: string) {
    const product = await this.productsRepository.findOneById(id);

    if (!product) throw new NotFoundException(PRODUCT_NOT_FOUND);

    await this.populateDoc(product);

    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    const product = await this.productsRepository.create(
      toEntity<Product>(createProductDto),
    );

    return await this.populateDoc(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { categories, subcategories } = updateProductDto;

    const categoriesUpdate: UpdateQuery<Product> =
      categories !== undefined && categories.length === 0
        ? { $unset: { categories: 1 }, ...updateProductDto }
        : { ...updateProductDto };

    const updateQuery: UpdateQuery<Product> =
      subcategories !== undefined && subcategories.length === 0
        ? { $unset: { subcategories: 1 }, ...updateProductDto }
        : categoriesUpdate;

    const result = await this.productsRepository.findByIdAndUpdate(
      id,
      updateQuery,
    );

    await this.populateDoc(result!);

    return result;
  }

  async remove(id: string) {
    return await this.productsRepository.findByIdAndDelete(id);
  }

  // Métodos para variantes
  getVariant(product: ProductDocument, variantId: string) {
    const variant = product.variants.id(variantId);

    if (!variant) throw new NotFoundException('Variant not found');

    return variant;
  }

  async addVariant(productId: string, createVariantDto: CreateVariantDto) {
    const product = await this.productsRepository.findByIdAndUpdate(productId, {
      $push: {
        variants: toEntity<Product['variants'][number]>(createVariantDto),
      },
      status: Status.ACTIVE,
    });

    if (!product) throw new NotFoundException(PRODUCT_NOT_FOUND);

    return product.variants[product.variants.length - 1];
  }

  async updateVariant(
    params: ParamsVariantDto,
    updateVariantDto: UpdateVariantDto,
  ) {
    const { productId, variantId } = params;

    const product = await this.findById(productId);

    const variant = this.getVariant(product, variantId);

    if (updateVariantDto.images !== undefined) {
      variant.images = updateVariantDto.images;
    }

    return variant;
  }

  async removeVariant(params: ParamsVariantDto) {
    const { productId, variantId } = params;
    const product = await this.findById(productId);
    const variant = this.getVariant(product, variantId);

    await this.productsRepository.findOneAndUpdate(
      { _id: productId },
      { $pull: { variants: { _id: variantId } } },
    );

    return variant;
  }

  async addVariantImages(params: ParamsVariantDto, imagePaths: string[]) {
    const { productId, variantId } = params;
    const product = await this.productsRepository.findOneAndUpdate(
      { _id: productId, 'variants._id': variantId },
      { $push: { 'variants.$.images': { $each: imagePaths } } },
    );

    if (!product) throw new NotFoundException(PRODUCT_NOT_FOUND);

    return this.getVariant(product, variantId);
  }

  async updateStock(
    productId: string,
    variantId: string,
    size: string,
    qty: number,
  ): Promise<void> {
    const res = await this.productsRepository.updateOne(
      { _id: productId, 'variants._id': variantId },
      {
        $inc: {
          'variants.$.sizesStock.$[elem].stock': qty,
        },
      },
      { arrayFilters: [{ 'elem.size': size }] },
    );

    if (res.modifiedCount === 0) {
      throw new NotFoundException(PRODUCT_NOT_FOUND);
    }
  }

  async getPrice(product: ProductDocument): Promise<number | null> {
    const offer = await this.offersService.findOneByQuery({
      status: Status.ACTIVE,
      byProduct: product.id,
    });

    let price = product.price;

    if (!offer) return null;

    if (offer.discountPercentage) {
      price *= 1 - offer.discountPercentage / 100;
    }

    if (offer.discountAmount) {
      price = Math.max(0, price - offer.discountAmount);
    }

    return price;
  }

  /**
   * * PRIVATE METHODS
   */

  private async populateDoc(product: ProductDocument) {
    return await product.populate(this.pathsPopulate);
  }
}
