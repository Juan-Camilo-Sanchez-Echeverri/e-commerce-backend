import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateFavoriteDto, UpdateFavoriteDto } from './dto';
import { Favorite, FavoriteDocument } from './schemas/favorite.schema';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(Favorite.name) private readonly favoriteModel: Model<Favorite>,
  ) {}

  async create(
    createFavoriteDto: CreateFavoriteDto,
  ): Promise<FavoriteDocument | null> {
    const { product } = createFavoriteDto;
    const listFavorite = await this.favoriteModel.findOne({
      user: createFavoriteDto.user,
    });

    if (listFavorite) {
      this.validateProductsExist(listFavorite, product);
      return await this.favoriteModel.findByIdAndUpdate(
        listFavorite._id,
        {
          $push: { products: { $each: [product] } },
        },
        { new: true },
      );
    }

    return await this.favoriteModel.create({
      ...createFavoriteDto,
      products: [product],
    });
  }

  async findMe(user: any): Promise<FavoriteDocument> {
    const listFavorites = await this.favoriteModel.findOne({ user }).populate({
      path: 'products',
      select: 'name description price images',
    });

    if (!listFavorites) throw new NotFoundException('No hay productos');

    return listFavorites;
  }

  async removeProduct(
    user: string,
    { product }: UpdateFavoriteDto,
  ): Promise<FavoriteDocument | null> {
    const favorite = await this.findMe(user);

    this.validateProductDelete(favorite, product);

    return await this.favoriteModel.findByIdAndUpdate(
      favorite._id,
      { $pull: { products: product } },
      { new: true },
    );
  }

  /**
   * * Private methods
   */

  private validateProductsExist(
    listFavorite: FavoriteDocument,
    productAdd: string,
  ): void {
    for (const product of listFavorite.products) {
      if (productAdd === String(product)) {
        throw new BadRequestException(
          `El producto ya existe en la lista de favoritos`,
        );
      }
    }
  }

  private validateProductDelete(
    favorite: FavoriteDocument,
    product: string | undefined,
  ): void {
    let productExist = false;
    for (const productFavorite of favorite.products) {
      if (String(productFavorite) === product) {
        productExist = true;
        break;
      }
    }

    if (!productExist) {
      throw new BadRequestException(
        'El producto no existe en la lista de favoritos',
      );
    }
  }
}
