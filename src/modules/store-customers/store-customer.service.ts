import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { QueryFilter } from 'mongoose';

import { StoreCustomerRepository } from './repositories/store-customer.repository';
import {
  StoreCustomer,
  StoreCustomerDocument,
} from './schemas/store-customer.schema';
import { CreateStoreCustomerDto, UpdateStoreCustomerDto } from './dto';
import { EncoderService } from '../encoder/encoder.service';
import {
  NOT_EXIST_USER,
  USER_IS_DELETED,
  USER_IS_INACTIVE,
} from '../../common/constants/users.constants';
import { Status } from '../../common/enums';

@Injectable()
export class StoreCustomerService {
  constructor(
    private readonly storeCustomerRepository: StoreCustomerRepository,
  ) {}

  async findOneByQuery(
    query: QueryFilter<StoreCustomer>,
  ): Promise<StoreCustomerDocument | null> {
    return await this.storeCustomerRepository.findOne(query);
  }

  async findByQuery(
    query: QueryFilter<StoreCustomer>,
  ): Promise<StoreCustomerDocument[]> {
    return await this.storeCustomerRepository.find(query);
  }

  async create(
    createStoreCustomerDto: CreateStoreCustomerDto,
  ): Promise<StoreCustomer> {
    const { password } = createStoreCustomerDto;

    if (password) {
      createStoreCustomerDto = {
        ...createStoreCustomerDto,
        password: await EncoderService.encodePassword(password),
      };
    }

    return await this.storeCustomerRepository.create(createStoreCustomerDto);
  }

  async findAll(): Promise<StoreCustomer[]> {
    return await this.storeCustomerRepository.find({});
  }

  async findById(id: string) {
    const customerUser = await this.storeCustomerRepository.findOneById(id, {
      password: 0,
    });

    if (!customerUser) throw new NotFoundException('Cliente no encontrado');

    return customerUser;
  }

  async update(
    id: string,
    updateStoreCustomerDto: UpdateStoreCustomerDto,
  ): Promise<StoreCustomerDocument | null> {
    await this.findById(id);

    const { password } = updateStoreCustomerDto;

    if (password) {
      updateStoreCustomerDto = {
        ...updateStoreCustomerDto,
        password: await EncoderService.encodePassword(password),
      };
    }

    return await this.storeCustomerRepository.findByIdAndUpdate(id, {
      $set: updateStoreCustomerDto,
    });
  }

  async remove(id: string): Promise<StoreCustomer | null> {
    await this.findById(id);
    return await this.storeCustomerRepository.findByIdAndDelete(id, {
      new: true,
    });
  }

  async findOneByPhone(phoneNumber: string): Promise<StoreCustomer | null> {
    return await this.storeCustomerRepository.findOne({
      phone: phoneNumber,
    });
  }

  checkUser(user: StoreCustomerDocument): void {
    if (!user) throw new NotFoundException(NOT_EXIST_USER);

    if (user.status === Status.INACTIVE) {
      throw new ForbiddenException(USER_IS_INACTIVE);
    }

    if (user.status === Status.DELETED) {
      throw new ForbiddenException(USER_IS_DELETED);
    }
  }
}
