import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SchedulerRegistry } from '@nestjs/schedule';

import {
  EmailMarketingDocument,
  EmailMarketing,
} from './schemas/email-marketing.schema';
import { SettingsEmailMarketingService } from '../settings-email-marketing/settings-email-marketing.service';
import { EmailSenderService } from './providers/email-sender.service';
import { CreateEmailMarketingDto, UpdateEmailMarketingDto } from './dto';
import { SettingsEmailMarketingDocument } from '../settings-email-marketing/schema/settings-email-marketing.schema';

@Injectable()
export class EmailMarketingService {
  constructor(
    @InjectModel(EmailMarketing.name)
    private readonly emailMarketingModel: Model<EmailMarketing>,
    private readonly settingsEmailMarketingService: SettingsEmailMarketingService,
    private readonly emailSenderService: EmailSenderService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async send(
    createEmailMarketingDto: CreateEmailMarketingDto,
  ): Promise<EmailMarketingDocument> {
    const config = await this.settingsEmailMarketingService.finOneByQuery({});

    const newCampaign = await this.emailMarketingModel.create(
      createEmailMarketingDto,
    );

    await this.createAndScheduleJob(
      newCampaign.id as string,
      config!,
      createEmailMarketingDto,
    );

    return newCampaign;
  }

  async update(
    id: string,
    updateEmailMarketingDto: UpdateEmailMarketingDto,
  ): Promise<EmailMarketingDocument> {
    const campaign = await this.emailMarketingModel.findOne({
      _id: id,
      isSent: false,
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found or already sent.');
    }

    const config = await this.settingsEmailMarketingService.finOneByQuery();

    this.stopAndRemoveJob(id);

    const updatedCampaign = await this.emailMarketingModel.findByIdAndUpdate(
      id,
      updateEmailMarketingDto,
      { new: true },
    );

    await this.createAndScheduleJob(id, config!, updateEmailMarketingDto);

    return updatedCampaign!;
  }

  async remove(id: string): Promise<EmailMarketingDocument | null> {
    const campaign = await this.emailMarketingModel.findById(id);

    if (!campaign) {
      throw new NotFoundException('Campaign not found.');
    }

    this.stopAndRemoveJob(id);

    return await this.emailMarketingModel.findByIdAndDelete(id);
  }

  async findAll(): Promise<EmailMarketingDocument[]> {
    return await this.emailMarketingModel.find();
  }

  async findOne(id: string): Promise<EmailMarketingDocument | null> {
    return await this.emailMarketingModel.findById(id);
  }

  private async createAndScheduleJob(
    jobId: string,
    config: SettingsEmailMarketingDocument,
    emailMarketingDto: CreateEmailMarketingDto | UpdateEmailMarketingDto,
  ): Promise<void> {
    await this.emailSenderService.sendEmailsToUsers(
      config,
      emailMarketingDto,
      jobId,
    );
  }

  private stopAndRemoveJob(jobName: string): void {
    const existingJob = this.schedulerRegistry.getCronJob(jobName);
    if (existingJob) {
      existingJob.stop();
      this.schedulerRegistry.deleteCronJob(jobName);
    }
  }
}
