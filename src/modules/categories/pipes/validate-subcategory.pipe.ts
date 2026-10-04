import { Injectable, PipeTransform } from '@nestjs/common';
import { CreateCategoryDto } from '../dto';

import { SubcategoriesService } from '../../subcategories/subcategories.service';

@Injectable()
export class ValidateSubcategoryPipe implements PipeTransform {
  constructor(private readonly subCategoriesService: SubcategoriesService) {}
  async transform(value: CreateCategoryDto) {
    const { subcategories } = value;

    if (subcategories) {
      await Promise.all(
        subcategories.map((subcategoryId) =>
          this.subCategoriesService.findById(subcategoryId),
        ),
      );
    }

    return value;
  }
}
