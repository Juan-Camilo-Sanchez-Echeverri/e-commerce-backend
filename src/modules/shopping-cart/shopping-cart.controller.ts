import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';

import {
  CreateShoppingCartDto,
  ProductInfo,
  UpdateShoppingCartDto,
} from './dto';
import { ShoppingCartService } from './shopping-cart.service';

import { Public } from '../../common/decorators';

import { ShoppingCartGuard } from './guards/shopping-cart.guard';
import { PayShoppingCartDto } from './dto/pay-shopping-cart.dto';

@Controller('shopping-cart')
export class ShoppingCartController {
  constructor(private readonly shoppingCartService: ShoppingCartService) {}

  @Get(':id')
  @Public()
  @UseGuards(ShoppingCartGuard)
  async findOne(@Param('id') id: string) {
    return await this.shoppingCartService.findOne(id);
  }

  @Post('pay/:id')
  @Public()
  @UseGuards(ShoppingCartGuard)
  async pay(
    @Param('id') id: string,
    @Body() payShoppingCartDto: PayShoppingCartDto,
  ) {
    return await this.shoppingCartService.pay(id, payShoppingCartDto);
  }

  @Post()
  @Public()
  async create(@Body() createShoppingCartDto: CreateShoppingCartDto) {
    return await this.shoppingCartService.create(createShoppingCartDto);
  }

  @Patch(':id')
  @Public()
  @UseGuards(ShoppingCartGuard)
  async update(
    @Param('id') id: string,
    @Body() updateShoppingCartDto: UpdateShoppingCartDto,
  ) {
    return await this.shoppingCartService.update(id, updateShoppingCartDto);
  }

  @Patch(':id/add-product')
  @Public()
  @UseGuards(ShoppingCartGuard)
  async addProduct(@Param('id') id: string, @Body() productInfo: ProductInfo) {
    return await this.shoppingCartService.addProduct(id, productInfo);
  }

  @Patch(':id/remove-product')
  @Public()
  @UseGuards(ShoppingCartGuard)
  async removeProduct(
    @Param('id') id: string,
    @Body() productInfo: ProductInfo,
  ) {
    return await this.shoppingCartService.removeProduct(id, productInfo);
  }
}
