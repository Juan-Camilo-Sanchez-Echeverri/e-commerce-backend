import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { EntityRepository } from '@common/database/entity.repository';

import { EmailRequest } from '../schemas/email-request.schema';

@Injectable()
export class EmailRequestRepository extends EntityRepository<EmailRequest> {
  constructor(@InjectModel(EmailRequest.name) model: Model<EmailRequest>) {
    super(model);
  }
}
