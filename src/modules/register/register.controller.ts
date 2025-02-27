import { Controller, Post, Body } from '@nestjs/common';
import { Public } from '@common/decorators/';
import { RegisterDto } from './dto/register.dto';
import { RegisterService } from './register.service';
import { EmailRequestService } from '../email-request/email-request.service';

@Controller('register')
export class RegisterController {
  constructor(
    private readonly registerService: RegisterService,
    private readonly emailRequestService: EmailRequestService,
  ) {}

  @Post()
  @Public()
  async register(@Body() registerDto: RegisterDto) {
    const storeCustomer = await this.registerService.register(registerDto);

    const { email } = storeCustomer;
    const expiresIn = new Date(Date.now() + 60 * 60 * 1000);

    await this.emailRequestService.create({
      email,
      type: 'activeAccount',
      expiresIn,
      password: registerDto.password ? false : true,
    });

    return storeCustomer;
  }
}
