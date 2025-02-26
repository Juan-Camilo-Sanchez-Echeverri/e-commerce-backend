import { Request } from 'express';
import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';

import { UpdateStoreCustomerDto } from './dto';
import { StoreCustomerService } from './store-customer.service';

import { Roles } from '../../common/decorators';

import { Role } from '../../common/enums';

@Controller('store-customer')
export class StoreCustomerController {
  constructor(private readonly storeCustomerService: StoreCustomerService) {}

  @Get()
  @Roles(Role.Supervisor)
  async findAll() {
    return await this.storeCustomerService.findAll();
  }

  @Get('me')
  @Roles(Role.Customer)
  async findMe(@Req() request: Request) {
    const { _id } = request.user;
    return await this.storeCustomerService.findById(_id);
  }

  @Get(':id')
  @Roles(Role.Supervisor, Role.Admin)
  async findOne(@Param('id') id: string) {
    return await this.storeCustomerService.findById(id);
  }

  @Patch('me')
  @Roles(Role.Customer)
  async updateMe(
    @Req() request: Request,
    @Body() updateStoreCustomerDto: UpdateStoreCustomerDto,
  ) {
    const { _id } = request.user;
    return await this.storeCustomerService.update(_id, updateStoreCustomerDto);
  }

  @Patch(':id')
  @Roles(Role.Supervisor, Role.Admin)
  update(
    @Param('id') id: string,
    @Body() updateStoreCustomerDto: UpdateStoreCustomerDto,
  ) {
    return this.storeCustomerService.update(id, updateStoreCustomerDto);
  }

  @Delete(':id')
  @Roles(Role.Supervisor, Role.Admin, Role.Manager)
  async remove(@Param('id') id: string) {
    return await this.storeCustomerService.remove(id);
  }
}
