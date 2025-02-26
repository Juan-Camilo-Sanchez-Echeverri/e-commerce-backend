import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateStatusStoreDto {
  @IsOptional()
  @IsBoolean()
  status?: boolean;

  user: any;

  @IsOptional()
  @IsBoolean()
  assignMe?: boolean;
}
