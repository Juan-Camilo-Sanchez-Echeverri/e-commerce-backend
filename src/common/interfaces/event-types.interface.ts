import { Events } from '../enums';
import type { IEmail } from '@modules/notifications/interfaces/email.interface';
import type { UserDocument } from '@modules/users/schemas/user.schema';

export interface EventPayloads {
  [Events.EMAIL_SEND]: IEmail;
  [Events.USER_CREATED]: UserDocument;
}
