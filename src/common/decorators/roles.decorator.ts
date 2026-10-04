import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { Role } from '../enums/roles.enums';

export const ROLES_KEY = 'roles';

type RolesValues = (keyof typeof Role | Role)[];

export const Roles = (...roles: RolesValues): CustomDecorator<string> => {
  const resolvedRoles = roles.map(
    (role) => Role[role as keyof typeof Role] || role,
  );

  return SetMetadata(ROLES_KEY, [Role.Supervisor, ...resolvedRoles]);
};

export const AllRoles = (): CustomDecorator<string> =>
  SetMetadata(ROLES_KEY, Object.values(Role));
