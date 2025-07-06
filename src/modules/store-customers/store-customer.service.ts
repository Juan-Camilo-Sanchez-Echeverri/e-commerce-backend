import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel } from 'mongoose';

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
    @InjectModel(StoreCustomer.name)
    private readonly storeCustomerModel: PaginateModel<StoreCustomer>,
  ) {}

  async findOneByQuery(
    query: FilterQuery<StoreCustomer>,
  ): Promise<StoreCustomerDocument | null> {
    return await this.storeCustomerModel.findOne(query);
  }

  async findByQuery(
    query: FilterQuery<StoreCustomer>,
  ): Promise<StoreCustomerDocument[]> {
    return await this.storeCustomerModel.find(query);
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

    return await this.storeCustomerModel.create(createStoreCustomerDto);
  }

  async findAll(): Promise<StoreCustomer[]> {
    return await this.storeCustomerModel.find();
  }

  async findById(id: string) {
    const customerUser = await this.storeCustomerModel.findById(id, {
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

    return await this.storeCustomerModel.findByIdAndUpdate(
      id,
      { $set: updateStoreCustomerDto },
      { new: true },
    );
  }

  async remove(id: string): Promise<StoreCustomer | null> {
    await this.findById(id);
    return await this.storeCustomerModel.findByIdAndDelete(id, { new: true });
  }

  async findOneByPhone(phoneNumber: string): Promise<StoreCustomer | null> {
    return await this.storeCustomerModel.findOne({ phone: phoneNumber });
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
