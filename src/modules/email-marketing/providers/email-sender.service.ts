import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';

import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

import { StoreCustomerService } from '@modules/customers/store-customer.service';
import { NotificationsService } from '@modules/notifications/notifications.service';
import { envs } from '@modules/config';

import { convertDateToCron } from '../helpers';
import { CreateEmailMarketingDto, UpdateEmailMarketingDto } from '../dto';
import { EmailMarketing } from '../schemas/email-marketing.schema';

@Injectable()
export class EmailSenderService {
  constructor(
    @InjectModel(EmailMarketing.name)
    private readonly emailMarketingModel: PaginateModel<EmailMarketing>,
    private readonly storeCustomerService: StoreCustomerService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private notificationService: NotificationsService,
  ) {}

  async sendEmailsToUsers(
    emailMarketingDto: CreateEmailMarketingDto | UpdateEmailMarketingDto,
    jobId: string,
  ): Promise<void> {
    const sendDate = emailMarketingDto?.sendDate;

    const senderEmail = envs.userNotifications;

    if (sendDate) {
      const cronFormat = convertDateToCron(sendDate);
      const job = new CronJob(cronFormat, async () => {
        await this.sendEmailBatch(senderEmail, emailMarketingDto, jobId);
      });

      this.schedulerRegistry.addCronJob(jobId, job);
      console.log('Job scheduled', cronFormat);
      job.start();
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
      if (userToSend.email && userToSend.notifications) {
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
      const dataEmail = {
        to: userEmail,
        from: senderEmail,
        subject: emailMarketingDto.subject!,
        htmlContent: emailMarketingDto.content!,
      };

      await this.notificationService.sendEmail(dataEmail);
      console.log('Email sent to', userEmail);
    } catch (error) {
      console.error('Error sending email', error);
      throw new InternalServerErrorException('Error sending email');
    }
  }

  private async updateCampaignAsSent(jobId: string): Promise<void> {
    await this.emailMarketingModel.findByIdAndUpdate(jobId, { isSent: true });
  }
}
