import { Body, Controller, Post, Query, Get } from '@nestjs/common';

import { Public } from '@common/decorators';

import { PaymentResponse } from './interfaces/payment-response.interface';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Public()
  @Post('webhooks')
  async handleWebhook(@Body() body: { resource: string; topic: string }) {
    await this.paymentsService.handleWebhook(body);

    return { ok: true };
  }

  @Public()
  @Get('success')
  handleSuccess(@Query() query: PaymentResponse) {
    return { message: 'Payment successful', query };
  }

  @Public()
  @Get('failure')
  handleFailure(@Query() query: PaymentResponse) {
    return { message: 'Payment failed', query };
  }
}
