import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { EntityRepository } from '@common/database/entity.repository';

import { EmailMarketing } from '../schemas/email-marketing.schema';

@Injectable()
export class EmailMarketingRepository extends EntityRepository<EmailMarketing> {
  constructor(@InjectModel(EmailMarketing.name) model: Model<EmailMarketing>) {
    super(model);
  }
}
