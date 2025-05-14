import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Request } from 'express';

import { StoreCustomerService } from '@modules/customers/store-customer.service';
import { UsersService } from '@modules/users/users.service';
import { IS_PUBLIC_KEY } from '@common/decorators';

import { NOT_TOKEN, UNAUTHENTICATED_USER } from '@common/constants';
import { PayloadLogin } from '../interfaces';
import { Role } from '@common/enums';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly storeCustomerService: StoreCustomerService,
    private readonly authService: AuthService,

    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.isPublicRoute(context);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();

    const token = this.extractTokenFromRequestHeader(request);

    const payload = await this.validateToken(token);

    const user = await this.findUser(payload);

    this.assignRequestUser(user, request);

    return true;
  }

  private isPublicRoute(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private extractTokenFromRequestHeader(request: Request): string {
    const authHeader = request.headers.authorization;
    if (!authHeader) throw new BadRequestException(NOT_TOKEN);

    const [bearer, token] = authHeader.split(' ');

    if (!bearer || bearer !== 'Bearer') {
      throw new BadRequestException(NOT_TOKEN);
    }

    if (!token) throw new BadRequestException(NOT_TOKEN);

    return token;
  }

  private async validateToken(token: string): Promise<PayloadLogin> {
    try {
      const decode = await this.jwtService.verifyAsync<PayloadLogin>(token);

      return decode;
    } catch (error: unknown) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('El token ha expirado');
      }

      throw new BadRequestException((error as Error).message);
    }
  }

  private async findUser(payload: PayloadLogin) {
    const service = this.getService(payload);
    const user = await service.findById(payload.sub);

    this.authService.checkUser(user);

    this.checkUserLastLogin(user!, payload);

    return user!;
  }

  private checkUserLastLogin(user: { lastLogin: Date }, payload: PayloadLogin) {
    const userLastLogin = user.lastLogin.toISOString();
    const payloadIat = new Date(payload.iat! * 1000).toISOString();

    this.validateUserLastLogin(userLastLogin, payloadIat);
  }

  private validateUserLastLogin(userLastLogin: string, payloadIat: string) {
    if (userLastLogin !== payloadIat) {
      const message = 'Este usuario ha iniciado sesión en otro dispositivo';
      throw new UnauthorizedException(message);
    }
  }

  private assignRequestUser(user: { name: string }, request: Request): void {
    request.user = user;

    if (!request.user) {
      throw new InternalServerErrorException(UNAUTHENTICATED_USER);
    }
  }

  private getService(payload: PayloadLogin) {
    return payload.roles.includes(Role.Customer)
      ? this.storeCustomerService
      : this.usersService;
  }
}
