import { Request } from 'express';
import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';

import { Roles } from '@common/decorators';
import { Status } from '@common/enums';

import { UserPlatform } from '../auth/interfaces';

import { UpdateStoreCustomerDto } from './dto';
import { StoreCustomerService } from './store-customer.service';

@Controller('store-customer')
export class StoreCustomerController {
  constructor(private readonly storeCustomerService: StoreCustomerService) {}

  @Get()
  @Roles()
  async findAll() {
    return await this.storeCustomerService.findAll();
  }

  @Get('me')
  @Roles('Customer')
  async findMe(@Req() request: Request) {
    const { _id } = request.user as UserPlatform;
    const id = String(_id);
    return await this.storeCustomerService.findById(id);
  }

  @Get(':id')
  @Roles('Admin')
  async findOne(@Param('id') id: string) {
    return await this.storeCustomerService.findById(id);
  }

  @Patch('me')
  @Roles('Customer')
  async updateMe(
    @Req() request: Request,
    @Body() updateStoreCustomerDto: UpdateStoreCustomerDto,
  ) {
    const { _id } = request.user as UserPlatform;
    const id = String(_id);
    return await this.storeCustomerService.update(id, updateStoreCustomerDto);
  }

  @Patch(':id')
  @Roles('Admin')
  update(
    @Param('id') id: string,
    @Body() updateStoreCustomerDto: UpdateStoreCustomerDto,
  ) {
    return this.storeCustomerService.update(id, updateStoreCustomerDto);
  }

  @Delete(':id')
  @Roles('Admin')
  async remove(@Param('id') id: string) {
    return await this.storeCustomerService.update(id, {
      status: Status.DELETED,
    });
  }
}
