import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

import { EmailMarketingRepository } from './repositories/email-marketing.repository';
import { EmailMarketingDocument } from './schemas/email-marketing.schema';
import { EmailSenderService } from './providers/email-sender.service';
import { CreateEmailMarketingDto, UpdateEmailMarketingDto } from './dto';

@Injectable()
export class EmailMarketingService {
  constructor(
    private readonly emailMarketingRepository: EmailMarketingRepository,
    private readonly emailSenderService: EmailSenderService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async send(
    createEmailMarketingDto: CreateEmailMarketingDto,
  ): Promise<EmailMarketingDocument> {
    const newCampaign = await this.emailMarketingRepository.create(
      createEmailMarketingDto,
    );

    if (createEmailMarketingDto.sendDate) {
      const dateCurrent = new Date();

      if (createEmailMarketingDto.sendDate < dateCurrent) {
        throw new BadRequestException('Send date must be in the future.');
      }
    }

    await this.createAndScheduleJob(newCampaign.id, createEmailMarketingDto);

    return newCampaign;
  }

  async update(
    id: string,
    updateEmailMarketingDto: UpdateEmailMarketingDto,
  ): Promise<EmailMarketingDocument> {
    const campaign = await this.emailMarketingRepository.findOne({
      _id: id,
      isSent: false,
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found or already sent.');
    }

    this.stopAndRemoveJob(id);

    const updatedCampaign =
      await this.emailMarketingRepository.findByIdAndUpdate(
        id,
        updateEmailMarketingDto,
      );

    if (!updatedCampaign) {
      throw new NotFoundException('Campaign not found.');
    }

    await this.createAndScheduleJob(id, updateEmailMarketingDto);

    return updatedCampaign;
  }

  async remove(id: string): Promise<EmailMarketingDocument | null> {
    const campaign = await this.emailMarketingRepository.findOneById(id);

    if (!campaign) {
      throw new NotFoundException('Campaign not found.');
    }

    this.stopAndRemoveJob(id);

    return await this.emailMarketingRepository.findByIdAndDelete(id);
  }

  async findAll(): Promise<EmailMarketingDocument[]> {
    return await this.emailMarketingRepository.find({});
  }

  async findOne(id: string): Promise<EmailMarketingDocument | null> {
    return await this.emailMarketingRepository.findOneById(id);
  }

  private async createAndScheduleJob(
    jobId: string,
    emailMarketingDto: CreateEmailMarketingDto | UpdateEmailMarketingDto,
  ): Promise<void> {
    await this.emailSenderService.sendEmailsToUsers(emailMarketingDto, jobId);
  }

  private stopAndRemoveJob(jobName: string): void {
    const existingJob = this.schedulerRegistry.getCronJob(jobName);
    if (existingJob) {
      void existingJob.stop();
      this.schedulerRegistry.deleteCronJob(jobName);
    }
  }
}
