import {
  INVALID_CREDENTIALS,
  NOT_TOKEN,
  UNAUTHENTICATED_USER,
  USER_HAS_NOT_ROLES,
  USER_IS_ACTIVE,
  USER_IS_DELETED,
  USER_IS_INACTIVE,
} from '@common/constants';
import { NOT_EXIST_USER } from '@common/constants/users.constants';
import { ServiceError } from '@common/responses';

/**
 * Canonical auth error payloads.
 *
 * The `message` values mirror exactly what `AuthService` and `AuthGuard`
 * throw today, so the Swagger examples stay truthful. The `code` field is the
 * machine-readable identifier that `HttpExceptionFilter` echoes back to clients.
 */
export const AuthErrors = {
  UNAUTHENTICATED_USER: {
    code: 'unauthorized',
    message: UNAUTHENTICATED_USER,
  },

  TOKEN_NOT_FOUND: {
    code: 'token-not-found',
    message: NOT_TOKEN,
  },

  TOKEN_EXPIRED: {
    code: 'token-expired',
    message: 'El token ha expirado',
  },

  INVALID_TOKEN: {
    code: 'invalid-token',
    message: NOT_TOKEN,
  },

  USER_HAS_NOT_ROLES: {
    code: 'forbidden',
    message: USER_HAS_NOT_ROLES,
  },

  USER_NOT_FOUND: {
    code: 'user-not-found',
    message: NOT_EXIST_USER,
  },

  USER_EMAIL_NOT_FOUND: {
    code: 'invalid-credentials',
    message: INVALID_CREDENTIALS,
  },

  PASSWORD_MISMATCH: {
    code: 'invalid-credentials',
    message: INVALID_CREDENTIALS,
  },

  USER_INACTIVE: {
    code: 'user-inactive',
    message: USER_IS_INACTIVE,
  },

  USER_DELETED: {
    code: 'user-not-found',
    message: USER_IS_DELETED,
  },

  USER_ALREADY_ACTIVE: {
    code: 'user-already-active',
    message: USER_IS_ACTIVE,
  },
} as const satisfies Record<string, ServiceError>;
