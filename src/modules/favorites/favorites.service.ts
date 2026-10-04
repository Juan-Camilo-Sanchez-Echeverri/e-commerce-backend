import { toEntity } from '@common/database';

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { CreateFavoriteDto, UpdateFavoriteDto } from './dto';
import { FavoritesRepository } from './repositories/favorites.repository';
import { Favorite, FavoriteDocument } from './schemas/favorite.schema';

@Injectable()
export class FavoritesService {
  constructor(private readonly favoritesRepository: FavoritesRepository) {}

  async create(
    createFavoriteDto: CreateFavoriteDto,
  ): Promise<FavoriteDocument | null> {
    const { product } = createFavoriteDto;
    const listFavorite = await this.favoritesRepository.findOne({
      user: createFavoriteDto.user,
    });

    if (listFavorite) {
      this.validateProductsExist(listFavorite, product);
      return await this.favoritesRepository.findByIdAndUpdate(
        listFavorite._id,
        {
          $push: { products: { $each: [product] } },
        },
      );
    }

    return await this.favoritesRepository.create(
      toEntity<Favorite>({
        ...createFavoriteDto,
        products: [product],
      }),
    );
  }

  async findMe(user: string): Promise<FavoriteDocument> {
    const listFavorites = await this.favoritesRepository.findOne({ user });

    if (!listFavorites) throw new NotFoundException('No hay productos');

    return await listFavorites.populate({
      path: 'products',
      select: 'name description price images',
    });
  }

  async removeProduct(
    user: string,
    { product }: UpdateFavoriteDto,
  ): Promise<FavoriteDocument | null> {
    const favorite = await this.findMe(user);

    this.validateProductDelete(favorite, product);

    return await this.favoritesRepository.findByIdAndUpdate(favorite._id, {
      $pull: { products: product },
    });
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
