import { IsString } from 'class-validator';

export class CreateFavoriteDto {
  user?: string;

  @IsString()
  product: string;
}
