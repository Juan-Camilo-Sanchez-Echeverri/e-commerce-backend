import { SubcategoriesService } from './../../subcategories/subcategories.service';
import { Injectable, PipeTransform } from '@nestjs/common';
import { CreateProductDto } from '../dto';
import { CategoriesService } from '../../categories/categories.service';

@Injectable()
export class ValidateProductPipe implements PipeTransform {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly subcategoriesServices: SubcategoriesService,
  ) {}

  async transform(value: CreateProductDto) {
    const { categories = [], subcategories = [] } = value;

    const categoryPromises = this.validateCategories(categories);
    const subcategoryPromises = this.validateSubcategories(subcategories);

    await Promise.all([...categoryPromises, ...subcategoryPromises]);

    return value;
  }

  private validateCategories(categories: string[]) {
    return categories.map((categoryId) =>
      this.categoriesService.findById(categoryId),
    );
  }

  private validateSubcategories(subcategories: string[]) {
    return subcategories.map((subcategoryId) =>
      this.subcategoriesServices.findById(subcategoryId),
    );
  }
}
