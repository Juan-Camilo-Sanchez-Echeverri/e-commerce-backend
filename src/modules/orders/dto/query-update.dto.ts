import { IsEnum } from 'class-validator';
import { SalesStatus } from '../../../common/enums';

export class QueryUpdateDto {
  @IsEnum(SalesStatus)
  status: SalesStatus;
}
