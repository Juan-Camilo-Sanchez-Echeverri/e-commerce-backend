import { PaginateResult } from '@common/database';

import {
  Injectable,
  OnModuleInit,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import {
  NOT_EXIST_USER,
  USER_IS_INACTIVE,
  USER_IS_DELETED,
} from '@common/constants';

import { generatePassword } from '@common/helpers';
import { Role, Status } from '@common/enums';

import { CreateUserDto, UpdateUserDto } from './dto';
import { UsersRepository } from './repositories/users.repository';
import { User, UserDocument } from './schemas/user.schema';
import { envs } from '../config';
import { FilterDto } from '@common/dto';
import { QueryFilter } from 'mongoose';
import { EncoderService } from '../encoder/encoder.service';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(private readonly usersRepository: UsersRepository) {}

  async onModuleInit(): Promise<void> {
    const users = await this.usersRepository.count({});
    if (users === 0) {
      await this.createUser({
        name: envs.defaultUserName,
        lastName: envs.defaultUserLastName,
        email: envs.defaultUserEmail,
        password: envs.defaultUserPassword,
        phone: envs.defaultUserPhone,
        status: Status.ACTIVE,
        roles: [Role.Supervisor],
      });
    }
  }

  async findOneById(id: string): Promise<UserDocument> {
    const user = await this.usersRepository.findOneById(id);
    if (!user) throw new NotFoundException(NOT_EXIST_USER);

    return user;
  }

  async findOneByQuery(query: QueryFilter<User>): Promise<UserDocument | null> {
    return await this.usersRepository.findOne(query);
  }

  async findPaginate(
    dto: FilterDto<User>,
  ): Promise<PaginateResult<UserDocument>> {
    return await this.usersRepository.findPaginate(dto);
  }

  async findByQuery(query: QueryFilter<User> = {}): Promise<UserDocument[]> {
    return await this.usersRepository.find(query);
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    const password = createUserDto.password || generatePassword();

    createUserDto.password = await EncoderService.encodePassword(password);

    const user = await this.usersRepository.create(createUserDto);

    return user;
  }

  checkUser(user: UserDocument): void {
    if (!user) throw new NotFoundException(NOT_EXIST_USER);

    if (user.status === Status.INACTIVE) {
      throw new ForbiddenException(USER_IS_INACTIVE);
    }

    if (user.status === Status.DELETED) {
      throw new ForbiddenException(USER_IS_DELETED);
    }
  }

  async update(
    id: UserDocument['id'],
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument | null> {
    await this.findById(id);
    const { password } = updateUserDto;

    if (password) {
      updateUserDto.password = await EncoderService.encodePassword(password);
    }

    const user = await this.usersRepository.findByIdAndUpdate(
      id,
      updateUserDto,
    );

    return user;
  }

  async removeUser(id: UserDocument['id']): Promise<UserDocument | null> {
    await this.findOne(id);

    const userDelete = await this.usersRepository.findByIdAndDelete(id);

    return userDelete;
  }

  // *Public methods

  async findOne(id: UserDocument['id']): Promise<UserDocument> {
    const user = await this.usersRepository.findOneById(id, { password: 0 });

    if (!user) throw new NotFoundException(NOT_EXIST_USER);

    return user;
  }

  async findById(id: UserDocument['id']): Promise<UserDocument | null> {
    return await this.usersRepository.findOneById(id, { password: 0 });
  }
}
