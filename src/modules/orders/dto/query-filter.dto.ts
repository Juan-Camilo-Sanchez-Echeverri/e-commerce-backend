import { SalesStatus } from '../../../common/enums';
import { IsEnum, IsOptional } from 'class-validator';

export class QueryFilterDto {
  @IsEnum(SalesStatus)
  @IsOptional()
  status?: SalesStatus;
}
