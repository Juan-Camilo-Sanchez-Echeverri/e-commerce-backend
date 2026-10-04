import { PaginateResult } from '../database';

import { FilterDto } from '../dto';

export interface ICrudService<T> {
  create(createDto: unknown): Promise<T>;
  findPaginate(
    filter: FilterDto<T>,
    cacheKey?: string,
  ): Promise<PaginateResult<T>>;

  findOneById(id: string): Promise<T | null>;
  update(id: string, updateDto: unknown): Promise<T | null>;
  remove(id: string): Promise<T | null>;
  populate?(document: T): Promise<T>;
  count?(filter: FilterDto<T>): Promise<number>;
}
