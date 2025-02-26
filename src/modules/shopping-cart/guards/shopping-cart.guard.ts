import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ShoppingCartService } from '../shopping-cart.service';

@Injectable()
export class ShoppingCartGuard implements CanActivate {
  constructor(private readonly shoppingCartService: ShoppingCartService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const { id } = request.params;

    const shoppingCart = await this.shoppingCartService.findOne(id);
    if (!shoppingCart)
      throw new NotFoundException('El carrito de compras no existe');

    return true;
  }
}
