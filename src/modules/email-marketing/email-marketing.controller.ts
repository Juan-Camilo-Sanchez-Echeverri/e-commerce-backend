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

import { Role } from '../../common/enums';

import { EmailMarketingDocument } from './schemas/email-marketing.schema';

@Controller('email-marketing')
export class EmailMarketingController {
  constructor(private readonly emailMarketingService: EmailMarketingService) {}

  @Get()
  @Roles('Supervisor', 'Admin', 'Manager')
  async findAll() {
    return await this.emailMarketingService.findAll();
  }

  @Get(':id')
  @Roles(Role.Supervisor, Role.Admin, Role.Manager)
  async findOne(
    @Param('id') id: string,
  ): Promise<EmailMarketingDocument | null> {
    return await this.emailMarketingService.findOne(id);
  }

  @Post('send')
  @Roles(Role.Admin, Role.Manager)
  async create(
    @Body() createEmailMarketingDto: CreateEmailMarketingDto,
  ): Promise<EmailMarketingDocument> {
    return await this.emailMarketingService.send(createEmailMarketingDto);
  }

  @Patch(':id')
  @Roles(Role.Supervisor, Role.Admin, Role.Manager)
  async update(
    @Param('id') id: string,
    @Body() updateEmailMarketingDto: UpdateEmailMarketingDto,
  ): Promise<EmailMarketingDocument> {
    return await this.emailMarketingService.update(id, updateEmailMarketingDto);
  }

  @Delete(':id')
  @Roles(Role.Supervisor, Role.Admin, Role.Manager)
  async remove(
    @Param('id') id: string,
  ): Promise<EmailMarketingDocument | null> {
    return await this.emailMarketingService.remove(id);
  }
}
