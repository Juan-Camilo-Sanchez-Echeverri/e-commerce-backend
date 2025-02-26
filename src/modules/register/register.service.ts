import { Injectable } from '@nestjs/common';

import { RegisterDto } from './dto/register.dto';
import { StoreCustomerService } from '../customers/store-customer.service';
import { EncoderService } from '../encoder/encoder.service';

@Injectable()
export class RegisterService {
  constructor(
    private readonly storeCustomerService: StoreCustomerService,
    private readonly encoderService: EncoderService,
  ) {}

  async register(registerDto: RegisterDto) {
    const storeCustomer = await this.storeCustomerService.create(registerDto);

    return storeCustomer;
  }
}
