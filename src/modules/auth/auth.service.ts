import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import {
  INVALID_CREDENTIALS,
  NOT_EXIST_USER,
  USER_IS_ACTIVE,
  USER_IS_DELETED,
  USER_IS_INACTIVE,
} from '@common/constants/';

import { Role, Status } from '@common/enums';

import { StoreCustomerService } from '@modules/customers/store-customer.service';
import { UsersService } from '@modules/users/users.service';
import { EncoderService } from '@modules/encoder/encoder.service';
import { EmailRequestService } from '@modules/email-request/email-request.service';

import {
  Payload,
  PayloadLogin,
  ResponseAuth,
  UserPlatform,
} from './interfaces';
import { LoginDto, RecoverPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { ActivateDto } from './dto/activate.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly emailRequestService: EmailRequestService,
    private readonly storeCustomerService: StoreCustomerService,
  ) {}

  async login(loginDto: LoginDto): Promise<ResponseAuth> {
    const { email, password } = loginDto;

    const user = await this.authenticateUser(email, password);

    const payload = this.generatePayload(user);
    const token = await this.generateToken(payload);

    const response: ResponseAuth = {
      token,
      user: await this.updateUserLoginStatus(user),
    };

    return response;
  }

  async activateAccount(
    activateDto: ActivateDto,
  ): Promise<{ active: boolean }> {
    const { token, email, password } = activateDto;

    const user = await this.findUserByEmail(email);

    if (!user || user.status === Status.ACTIVE) return { active: false };

    this.checkPasswordRequire(user, password);

    const serviceUpdate = this.getService(user.roles);

    await this.emailRequestService.validate({
      email,
      token,
      type: 'activeAccount',
    });

    const dataUpdated = activateDto.password
      ? { password: activateDto.password, status: Status.ACTIVE }
      : { status: Status.ACTIVE };

    await serviceUpdate.update(user.id, dataUpdated);

    return { active: true };
  }

  async requestActivateAccount(email: string) {
    const user = await this.findUserByEmail(email);

    if (!user) throw new BadRequestException(NOT_EXIST_USER);

    if (user.status === Status.ACTIVE) {
      throw new BadRequestException(USER_IS_ACTIVE);
    }

    const expiresIn = new Date(Date.now() + 60 * 60 * 1000);
    await this.emailRequestService.create({
      email,
      type: 'activeAccount',
      expiresIn,
      password: user.password ? false : true,
    });

    return { send: true };
  }

  async recoverPassword(recoverPasswordDto: RecoverPasswordDto) {
    const { email } = recoverPasswordDto;

    const user = await this.findUserByEmail(email);

    this.checkUser(user);

    const expiresIn = new Date(Date.now() + 10 * 60 * 1000);
    await this.emailRequestService.create({
      email,
      type: 'recoverPassword',
      expiresIn,
    });

    return { send: true };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, email, password } = resetPasswordDto;

    const user = await this.findUserByEmail(email);

    this.checkUser(user);

    await this.emailRequestService.validate({
      email,
      token,
      type: 'recoverPassword',
    });

    const serviceUpdate = this.getService(user!.roles);
    const iat = Math.floor(new Date().getTime() / 1000.0);

    await serviceUpdate.update(String(user?._id), {
      password,
      lastLogin: new Date(iat * 1000),
    });

    return { changed: true };
  }

  async refreshToken(token: string): Promise<{ token: string }> {
    const payload = await this.jwtService.verifyAsync<PayloadLogin>(token, {
      ignoreExpiration: true,
    });

    const service = this.getService(payload.roles);

    const user = await service.findOneByQuery({ _id: payload.sub });

    this.checkUser(user);

    delete payload.iat;
    delete payload.exp;

    const newToken = await this.generateToken(payload);

    await this.updateUserLoginStatus(user!);

    return { token: newToken };
  }

  checkUser(user: UserPlatform | null) {
    if (!user) throw new BadRequestException(NOT_EXIST_USER);

    if (user.status === Status.INACTIVE) {
      throw new ForbiddenException(USER_IS_INACTIVE);
    }

    if (user.status === Status.DELETED) {
      throw new ForbiddenException(USER_IS_DELETED);
    }
  }

  private checkPasswordRequire(user: UserPlatform, password?: string) {
    if (!user.password && !password) {
      throw new BadRequestException('Password is required');
    }

    if (user.password && password) {
      throw new BadRequestException('Password is not required');
    }
  }

  private async authenticateUser(email: string, password: string) {
    const user = await this.findUserByEmail(email);

    if (!user) throw new ForbiddenException(INVALID_CREDENTIALS);

    const match = await EncoderService.checkPassword(password, user.password);

    if (!match) throw new ForbiddenException(INVALID_CREDENTIALS);

    this.checkUser(user);

    return user;
  }

  private async findUserByEmail(email: string): Promise<UserPlatform | null> {
    const user =
      (await this.usersService.findOneByQuery({ email })) ||
      (await this.storeCustomerService.findOneByQuery({ email }));

    return user;
  }

  private async generateToken(payload: Payload): Promise<string> {
    return await this.jwtService.signAsync(payload);
  }

  private async updateUserLoginStatus(
    user: UserPlatform,
  ): Promise<UserPlatform> {
    const iat = Math.floor(new Date().getTime() / 1000.0);

    const serviceUpdate = this.getService(user.roles);

    const updatedUser = await serviceUpdate.update(user.id, {
      lastLogin: new Date(iat * 1000),
    });

    return updatedUser!;
  }

  private generatePayload(user: UserPlatform) {
    const payload: PayloadLogin = {
      sub: user.id as string,
      name: user.name,
      roles: user.roles,
    };

    return payload;
  }

  private getService(roles: Role[]) {
    return roles.includes(Role.Customer)
      ? this.storeCustomerService
      : this.usersService;
  }
}
