import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { Role } from '../enums/roles.enums';

export const ROLES_KEY = 'roles';

type RolesValues = (keyof typeof Role | Role)[];

export const Roles = (...roles: RolesValues): CustomDecorator<string> => {
  return SetMetadata(ROLES_KEY, [Role.Supervisor, ...roles]);
};

export const AllRoles = (): CustomDecorator<string> =>
  SetMetadata(ROLES_KEY, Object.values(Role));
