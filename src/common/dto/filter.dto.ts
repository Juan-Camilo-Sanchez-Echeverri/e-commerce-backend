import { FilterQuery } from 'mongoose';
import { IsOptional } from 'class-validator';
import { PaginationDto } from './pagination.dto';

// ? el generico es el documento que se va a filtrar
export class FilterDto<T> extends PaginationDto {
  @IsOptional()
  data?: FilterQuery<T> = {};
}
