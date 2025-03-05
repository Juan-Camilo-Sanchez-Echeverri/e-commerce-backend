import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { EmailMarketingService } from './email-marketing.service';
import { CreateEmailMarketingDto, UpdateEmailMarketingDto } from './dto';
import { Roles } from '../../common/decorators';

import { EmailMarketingDocument } from './schemas/email-marketing.schema';

@Controller('email-marketing')
export class EmailMarketingController {
  constructor(private readonly emailMarketingService: EmailMarketingService) {}

  @Get()
  @Roles('Admin')
  async findAll() {
    return await this.emailMarketingService.findAll();
  }

  @Get(':id')
  @Roles('Supervisor', 'Admin')
  async findOne(
    @Param('id') id: string,
  ): Promise<EmailMarketingDocument | null> {
    return await this.emailMarketingService.findOne(id);
  }

  @Post('send')
  @Roles('Admin')
  async create(
    @Body() createEmailMarketingDto: CreateEmailMarketingDto,
  ): Promise<EmailMarketingDocument> {
    return await this.emailMarketingService.send(createEmailMarketingDto);
  }

  @Patch(':id')
  @Roles('Supervisor', 'Admin')
  async update(
    @Param('id') id: string,
    @Body() updateEmailMarketingDto: UpdateEmailMarketingDto,
  ): Promise<EmailMarketingDocument> {
    return await this.emailMarketingService.update(id, updateEmailMarketingDto);
  }

  @Delete(':id')
  @Roles('Supervisor', 'Admin')
  async remove(
    @Param('id') id: string,
  ): Promise<EmailMarketingDocument | null> {
    return await this.emailMarketingService.remove(id);
  }
}
