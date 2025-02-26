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

  // @Get()
  // @Roles(Role.Supervisor)
  // async findAll(@Query() queryPaginateDto: QueryPaginateDto) {
  //   return this.usersService.findAll(queryPaginateDto);
  // }

  @Get(':id')
  @Roles(Role.Supervisor, Role.Admin, Role.Manager)
  async findAnyUser(@Param('id') id: string): Promise<UserDocument> {
    return await this.usersService.findOne(id);
  }

  @Post()
  @Roles(Role.Supervisor, Role.Admin, Role.Manager)
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Query('role') role: Role,
  ): Promise<UserDocument> {
    createUserDto.roles = [role];
    const user = await this.usersService.createUser(createUserDto);

    return user;
  }

  @Patch('me')
  @Roles(Role.Admin, Role.Manager, Role.Agent, Role.Supervisor)
  async updateMe(
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: Request,
  ) {
    const user = request.user as UserDocument;
    return await this.usersService.update(String(user._id), updateUserDto);
  }

  @Patch(':id')
  @Roles(Role.Supervisor)
  async updateAnyUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.Supervisor)
  async deleteAnyUser(@Param('id') id: string) {
    return await this.usersService.removeUser(id);
  }
}
