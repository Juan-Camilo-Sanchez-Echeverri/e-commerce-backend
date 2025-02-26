import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';

import { CreateProductDto, UpdateProductDto } from './dto';
import { Product, ProductDocument } from './schemas/product.schema';

import { PRODUCT_NOT_FOUND, PRODUCT_NAME_EXIST } from '../../common/constants';

import { OffersService } from '../offers/offers.service';
import { OfferDocument } from '../offers/schemas/offer.schema';
import { ProductCategoriesService } from '../product-categories/product-categories.service';
import { ProductAttributesService } from '../product-attributes/product-attributes.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: PaginateModel<Product>,

    private readonly offersService: OffersService,
    private readonly productCategoriesService: ProductCategoriesService,
    private readonly productAttributesService: ProductAttributesService,
  ) {}

  async findAll(): Promise<ProductDocument[]> {
    return await this.productModel.find();
  }

  async findOne(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException(PRODUCT_NOT_FOUND);
    return product;
  }

  async findPublic() {
    const products = await this.productModel.find({
      isActive: true,
    });

    const offers = await this.offersService.findByQuery({});

    const formattedProducts = products.map((product) => {
      const offerForProduct = offers.find(
        (offer) => String(offer.byProduct?.['_id']) === String(product._id),
      );

      if (offerForProduct) {
        return this.formatProductWithOffer(product, offerForProduct);
      }

      return product;
    });

    return formattedProducts;
  }

  private formatProductWithOffer(
    product: ProductDocument,
    offer: OfferDocument,
  ) {
    let formatProduct: {
      priceInOffer: number;
      name: string;
      description: string;
      price: number;
      stock: number;
      stockInitial: number;
      limitWarningStock: number;
      images: string[];
      isActive: boolean;
      qualificationsCount: number;
      qualificationsAverage: number;
      categories?: string[];
      attributes?: string[];
      _id: Types.ObjectId;
      __v: number;
    } = { ...product.toObject(), priceInOffer: product.price };
    if (offer.discountAmount) {
      formatProduct = {
        ...product.toObject(),
        priceInOffer: product.price - offer.discountAmount,
      };
    }
    if (offer.discountPercentage) {
      formatProduct = {
        ...product.toObject(),
        priceInOffer:
          product.price - (product.price * offer.discountPercentage) / 100,
      };
    }

    return formatProduct;
  }

  async findOneByQuery(query: FilterQuery<ProductDocument> = {}) {
    return await this.productModel.findOne(query);
  }

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    const { name, categories = [], attributes = [] } = createProductDto;

    for (const category of categories) {
      await this.productCategoriesService.findOne(category);
    }

    for (const attribute of attributes) {
      await this.productAttributesService.findOne(attribute);
    }

    await this.validateNameExist(name, null);
    return await this.productModel.create(createProductDto);
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const productExist = await this.findOne(id);
    let updateQuery: { [key: string]: any } = {};
    const { name, categories, attributes, isActive } = updateProductDto;
    if (name) await this.validateNameExist(name, id);

    if (isActive !== undefined) {
      await this.validateNameExist(productExist.name, id);
    }

    if (categories !== undefined && categories.length === 0) {
      updateQuery = { $unset: { categories: 1 }, ...updateProductDto };
    } else {
      updateQuery = updateProductDto;
    }

    if (attributes !== undefined && attributes.length === 0) {
      updateQuery = { $unset: { attributes: 1 }, ...updateQuery };
    }

    return await this.productModel.findOneAndUpdate({ _id: id }, updateQuery, {
      new: true,
    });
  }

  async remove(id: string) {
    return await this.productModel.findByIdAndDelete(id);
  }

  async updateQualificationAverage(id: string, qualification: number) {
    const product = await this.findOne(id);
    const { qualificationsAverage, qualificationsCount } = product;
    const newQualificationAverage = this.roundToOneDecimalPlace(
      (qualificationsCount * qualificationsAverage + qualification) /
        (qualificationsCount + 1),
    );
    return await this.productModel.findByIdAndUpdate(
      id,
      {
        qualificationsAverage: newQualificationAverage,
        qualificationsCount: qualificationsCount + 1,
      },
      { new: true },
    );
  }

  async removeStock(id: string, quantity: number) {
    return await this.productModel.findByIdAndUpdate(
      id,
      {
        $inc: { stock: -quantity },
      },
      { new: true },
    );
  }

  async addStock(id: string, quantity: number) {
    return await this.productModel.findByIdAndUpdate(
      id,
      {
        $inc: { stock: quantity },
      },
      { new: true },
    );
  }

  /**
   * * PRIVATE METHODS
   */

  private async validateNameExist(
    name: string,
    productId: string | null,
  ): Promise<void> {
    const product = await this.productModel.findOne({
      name,
      _id: { $ne: productId },
      isActive: true,
    });
    if (product) throw new BadRequestException(PRODUCT_NAME_EXIST);
  }

  private roundToOneDecimalPlace(num: number): number {
    return Math.round((num + Number.EPSILON) * 10) / 10;
  }
}
