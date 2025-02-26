import { Module } from '@nestjs/common';

import { RegisterService } from './register.service';
import { RegisterController } from './register.controller';

import { UsersModule } from '../users/users.module';
import { StoreCustomerModule } from '../customers/store-customer.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailRequestModule } from '../email-request/email-request.module';

@Module({
  imports: [UsersModule, StoreCustomerModule, EmailRequestModule],
  providers: [RegisterService],
  controllers: [RegisterController],
  exports: [RegisterService],
})
export class RegisterModule {}
