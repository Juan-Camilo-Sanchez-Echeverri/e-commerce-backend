import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Options } from 'nodemailer/lib/mailer';

import { IEmail } from '../interfaces/email.interface';

@Injectable()
export class EmailProvider {
  constructor() {}
  logger = new Logger('EmailProvider');
  private async getEmailCredentials() {
    return {
      user: 'juancamilosanche65@gmail.com',
      pass: 'ancc moan mjbx edcg',
    };
  }

  async sendEmail(data: IEmail) {
    try {
      const { to, subject, htmlContent } = data;
      const { user, pass } = await this.getEmailCredentials();

      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        secure: false,
        auth: { user, pass },
      });

      const mailOptions: Options = {
        from: user,
        to,
        subject,
        html: htmlContent,
      };

      await transporter.sendMail(mailOptions);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
