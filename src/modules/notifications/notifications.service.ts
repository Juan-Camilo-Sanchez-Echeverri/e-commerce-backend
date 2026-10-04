import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IEmail } from './interfaces/email.interface';

@Injectable()
export class NotificationsService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async sendEmail(dataEmail: IEmail) {
    await this.eventEmitter.emitAsync('email.send', dataEmail);
  }
}
