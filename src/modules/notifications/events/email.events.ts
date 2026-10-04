import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailProvider } from '../providers/email.provider';
import { IEmail } from '../interfaces/email.interface';

@Injectable()
export class EmailEvent {
  constructor(private readonly emailProvider: EmailProvider) {}

  @OnEvent('email.send', { async: true })
  async sendEmail(data: IEmail) {
    await this.emailProvider.sendEmail(data);
  }
}
