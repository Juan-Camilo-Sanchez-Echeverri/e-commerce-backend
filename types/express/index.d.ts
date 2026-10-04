import { StoreCustomerDocument } from '@modules/store-customers/schemas/store-customer.schema';
import { UserDocument } from '@modules/users/schemas/user.schema';

export type AuthenticatedUser = UserDocument | StoreCustomerDocument;

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}