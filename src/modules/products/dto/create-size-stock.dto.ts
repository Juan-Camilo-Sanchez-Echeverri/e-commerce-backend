import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateSizeStockDto {
  @IsNotEmpty()
  @IsString()
  size: string;

  @IsNotEmpty()
  @IsNumber()
  stock: number;
}
