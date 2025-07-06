import { StoreCustomerDocument } from '../../store-customers/schemas/store-customer.schema';
import { UserDocument } from '../../users/schemas/user.schema';

export type UserPlatform = UserDocument | StoreCustomerDocument;
