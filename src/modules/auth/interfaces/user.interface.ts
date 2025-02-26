import { StoreCustomerDocument } from '../../customers/schemas/customer.schema';
import { UserDocument } from '../../users/schemas/user.schema';

export type UserPlatform = UserDocument | StoreCustomerDocument;
