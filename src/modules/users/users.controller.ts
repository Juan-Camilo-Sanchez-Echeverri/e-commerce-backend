import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Patch,
  Query,
  Req,
} from '@nestjs/common';

import { CreateUserDto, UpdateUserDto } from './dto';
import { UserDocument } from './schemas/user.schema';
import { UsersService } from './users.service';

import { Roles } from '../../common/decorators';

import { Role } from '../../common/enums';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @Roles('Admin')
  async findAnyUser(@Param('id') id: string): Promise<UserDocument> {
    return await this.usersService.findOne(id);
  }

  @Post()
  @Roles('Admin')
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Query('role') role: Role,
  ): Promise<UserDocument> {
    createUserDto.roles = [role];
    const user = await this.usersService.createUser(createUserDto);

    return user;
  }

  @Patch('me')
  @Roles('Admin')
  async updateMe(
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: Request,
  ) {
    const user = request.user as UserDocument;
    return await this.usersService.update(String(user._id), updateUserDto);
  }

  @Patch(':id')
  @Roles('Admin')
  async updateAnyUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('Admin')
  async deleteAnyUser(@Param('id') id: string) {
    return await this.usersService.removeUser(id);
  }
}
