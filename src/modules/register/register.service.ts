import { Injectable } from '@nestjs/common';

import { RegisterDto } from './dto/register.dto';
import { StoreCustomerService } from '../customers/store-customer.service';

@Injectable()
export class RegisterService {
  constructor(private readonly storeCustomerService: StoreCustomerService) {}

  async register(registerDto: RegisterDto) {
    const storeCustomer = await this.storeCustomerService.create(registerDto);

    return storeCustomer;
  }
}
