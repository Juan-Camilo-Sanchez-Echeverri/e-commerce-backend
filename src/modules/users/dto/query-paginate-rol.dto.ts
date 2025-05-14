import { IsEnum, IsOptional } from 'class-validator';

import { Role } from '@common/enums';
import { PaginationDto } from '@common/dto';

export class QueryPaginateDto extends PaginationDto {
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
