import { Reflector } from '@nestjs/core';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

import { USER_HAS_NOT_ROLES } from '../constants';
import { ROLES_KEY } from '../decorators';
import { Role } from '../enums';
import { extractUserFromRequest } from '../helpers';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const userRoles = this.extractUserRolesFromRequestUser(request);
    if (!userRoles || !this.hasValidRoles(roles, userRoles)) {
      throw new ForbiddenException(USER_HAS_NOT_ROLES);
    }

    return true;
  }

  hasValidRoles(validRoles: Role[], candidateRoles: Role[]): boolean {
    return candidateRoles.some((role) => validRoles.includes(role));
  }

  extractUserRolesFromRequestUser(request: Request): Role[] {
    return extractUserFromRequest(request).roles;
  }
}
