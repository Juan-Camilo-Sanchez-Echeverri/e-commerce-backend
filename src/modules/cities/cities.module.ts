import { Module } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CitiesController } from './cities.controller';
import { CitiesRepository } from './repositories/cities.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { City, CitySchema } from './schemas/city.schema';
import { StatesModule } from '../states/states.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: City.name, schema: CitySchema }]),
    StatesModule,
  ],
  controllers: [CitiesController],
  providers: [CitiesService, CitiesRepository],
  exports: [CitiesService],
})
export class CitiesModule {}
