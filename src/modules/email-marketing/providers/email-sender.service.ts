import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
// import * as SendGrid from '@sendgrid/mail';

import { StoreCustomerService } from '../../customers/store-customer.service';

import { SettingsEmailMarketingDocument } from '../../settings-email-marketing/schema/settings-email-marketing.schema';
import { CreateEmailMarketingDto, UpdateEmailMarketingDto } from '../dto';
import { convertDateToCron } from '../helpers';
import { InjectModel } from '@nestjs/mongoose';
import { EmailMarketing } from '../schemas/email-marketing.schema';
import { Model } from 'mongoose';

@Injectable()
export class EmailSenderService {
  constructor(
    @InjectModel(EmailMarketing.name)
    private readonly emailMarketingModel: Model<EmailMarketing>,
    private readonly storeCustomerService: StoreCustomerService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async sendEmailsToUsers(
    config: SettingsEmailMarketingDocument,
    emailMarketingDto: CreateEmailMarketingDto | UpdateEmailMarketingDto,
    jobId: string,
  ): Promise<void> {
    const sendDate = emailMarketingDto?.sendDate;
    const { apiKey, senderEmail } = config;

    // SendGrid.setApiKey(apiKey);

    if (sendDate) {
      const cronFormat = convertDateToCron(sendDate);
      const job = new CronJob(cronFormat, async () => {
        await this.sendEmailBatch(senderEmail, emailMarketingDto, jobId);
      });

      this.schedulerRegistry.addCronJob(jobId, job);
    } else {
      await this.sendEmailBatch(senderEmail, emailMarketingDto, jobId);
    }
  }

  private async sendEmailBatch(
    senderEmail: string,
    emailMarketingDto: CreateEmailMarketingDto | UpdateEmailMarketingDto,
    jobId: string,
  ): Promise<void> {
    const { usersSent } = emailMarketingDto;
    const sendEmailPromises = usersSent!.map(async (user) => {
      const userToSend = await this.storeCustomerService.findById(user);
      if (userToSend.email) {
        await this.sendEmail(userToSend.email, senderEmail, emailMarketingDto);
      }
    });

    await Promise.all(sendEmailPromises);

    await this.updateCampaignAsSent(jobId);
  }

  private async sendEmail(
    userEmail: string,
    senderEmail: string,
    emailMarketingDto: CreateEmailMarketingDto | UpdateEmailMarketingDto,
  ): Promise<void> {
    try {
      // const send = await SendGrid.send({
      //   to: userEmail,
      //   from: senderEmail,
      //   subject: emailMarketingDto.subject,
      //   html: emailMarketingDto.content,
      // });
      // if (send) emailMarketingDto.isSent = true;
    } catch (error) {
      console.error('Error sending email', error);
      throw new InternalServerErrorException('Error sending email');
    }
  }

  private async updateCampaignAsSent(jobId: string): Promise<void> {
    await this.emailMarketingModel.findByIdAndUpdate(jobId, { isSent: true });
  }
}
