import { randomBytes } from 'crypto';

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Cron, CronExpression } from '@nestjs/schedule';

import { checkExpiration } from '@common/helpers';

import { EmailRequestDto } from './dto/email-request.dto';
import type { TypeRequest } from './types/type-request';
import { EmailRequest } from './schemas/email-request.schema';
import { ValidateEmailRequest } from './dto/validate-email-request.dto';
import { activeAccount } from '../notifications/templates/email/active-account';
import { NotificationsService } from '../notifications/notifications.service';

const MAX_ATTEMPTS = 3;

interface DataEmailActive {
  email: string;
  token: string;
  password: boolean;
}

@Injectable()
export class EmailRequestService {
  constructor(
    @InjectModel(EmailRequest.name)
    private emailRequestModel: Model<EmailRequest>,
    private notificationService: NotificationsService,
  ) {}

  async create(data: EmailRequestDto) {
    const { email, type, expiresIn, password = true } = data;

    const token = this.generateToken();

    const existingRequest = await this.emailRequestModel.findOne({ email });

    if (existingRequest) this.validateAttempts(existingRequest, type);

    const update = {
      $set: { [`${type}.token`]: token, [`${type}.expiresIn`]: expiresIn },
      $inc: { [`${type}.attempts`]: 1 },
    };

    if (type === 'activeAccount') {
      await this.sendEmailActive({ email, token, password });
    }

    await this.emailRequestModel.findOneAndUpdate({ email }, update, {
      new: true,
      upsert: true,
    });
  }

  private async sendEmailActive(data: DataEmailActive) {
    const dataEmail = {
      to: data.email,
      subject: 'Bienvenido a la tienda',
      htmlContent: activeAccount(data),
    };

    await this.notificationService.sendEmail(dataEmail);
  }

  validateAttempts(request: EmailRequest, type: TypeRequest): void {
    if (request[type] && request[type].attempts >= MAX_ATTEMPTS) {
      throw new ConflictException('Maximum number of attempts reached');
    }
  }

  async validate(validateEmailRequest: ValidateEmailRequest) {
    const { email, token, type } = validateEmailRequest;

    const request = await this.emailRequestModel
      .findOne({ email })
      .select(`${type}`);

    if (!request || request[type]?.token !== token) {
      throw new NotFoundException('Invalid token');
    }

    if (this.checkExpiration(request, type)) {
      throw new ConflictException('Token expired');
    }

    await this.emailRequestModel.updateOne(
      { email },
      { $set: { [`${type}.token`]: '', [`${type}.expiresIn`]: '' } },
    );
  }

  private checkExpiration(request: EmailRequest, type: TypeRequest): boolean {
    const { expiresIn } = request[type] || {};

    return checkExpiration(expiresIn!);
  }

  private generateToken(): string {
    return randomBytes(20).toString('hex');
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanExpiredRequests() {
    await this.emailRequestModel.deleteMany({
      'activeAccount.expiresIn': { $lt: new Date() },
    });
  }
}
