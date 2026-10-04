import {
  Injectable,
  OnModuleInit,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel } from 'mongoose';

import {
  NOT_EXIST_USER,
  USER_IS_INACTIVE,
  USER_IS_DELETED,
} from '@common/constants';

import { generatePassword } from '@common/helpers';
import { Role, Status } from '@common/enums';

import { CreateUserDto, UpdateUserDto } from './dto';
import { User, UserDocument } from './schemas/user.schema';
import { envs } from '../config';
import { FilterDto } from '@common/dto';
import { PaginateResult } from 'mongoose';
import { EncoderService } from '../encoder/encoder.service';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(@InjectModel(User.name) private userModel: PaginateModel<User>) {}

  async onModuleInit(): Promise<void> {
    const users = await this.userModel.countDocuments();
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
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException(NOT_EXIST_USER);

    return user;
  }

  async findOneByQuery(
    query: FilterQuery<UserDocument>,
  ): Promise<UserDocument | null> {
    return await this.userModel.findOne(query);
  }

  async findPaginate(
    dto: FilterDto<UserDocument>,
  ): Promise<PaginateResult<UserDocument>> {
    const { data, limit, page } = dto;
    return await this.userModel.paginate(data, { page, limit });
  }

  async findByQuery(
    query: FilterQuery<UserDocument> = {},
  ): Promise<UserDocument[]> {
    return await this.userModel.find(query);
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    const password = createUserDto.password || generatePassword();

    createUserDto.password = await EncoderService.encodePassword(password);

    const user = await this.userModel.create(createUserDto);

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
    let user = await this.findById(id);
    const { password } = updateUserDto;

    if (password) {
      updateUserDto.password = await EncoderService.encodePassword(password);
    }

    user = await this.userModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
    });

    return user;
  }

  async removeUser(id: UserDocument['id']): Promise<UserDocument | null> {
    await this.findOne(id);

    const userDelete = await this.userModel.findByIdAndDelete(id);

    return userDelete;
  }

  // *Public methods

  async findOne(id: UserDocument['id']): Promise<UserDocument> {
    const user = await this.userModel.findById(id, { password: 0 });

    if (!user) throw new NotFoundException(NOT_EXIST_USER);

    return user;
  }

  async findById(id: UserDocument['id']): Promise<UserDocument | null> {
    return await this.userModel.findById(id, { password: 0 });
  }
}
