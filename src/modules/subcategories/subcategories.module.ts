import { Module } from '@nestjs/common';
import { SubcategoriesService } from './subcategories.service';
import { SubcategoriesController } from './subcategories.controller';
import { SubcategoriesRepository } from './repositories/subcategories.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Subcategory, SubcategorySchema } from './schemas/subcategory.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subcategory.name, schema: SubcategorySchema },
    ]),
  ],
  controllers: [SubcategoriesController],
  providers: [SubcategoriesService, SubcategoriesRepository],
  exports: [SubcategoriesService],
})
export class SubcategoriesModule {}
