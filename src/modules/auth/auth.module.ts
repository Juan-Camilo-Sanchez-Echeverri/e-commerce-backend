import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { StoreCustomerModule } from '../customers/store-customer.module';

import { envs } from '../config';
import { UsersModule } from '../users/users.module';
import { EmailRequestModule } from '../email-request/email-request.module';

@Module({
  imports: [
    UsersModule,
    StoreCustomerModule,
    EmailRequestModule,
    JwtModule.register({
      global: true,
      secret: envs.jwtSecret,
      signOptions: { expiresIn: envs.expiresIn },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
