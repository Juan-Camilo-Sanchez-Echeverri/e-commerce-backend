import { HttpStatus, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';

import { createLogger, format, transports } from 'winston';
import * as SlackHook from 'winston-slack-webhook-transport';

import { envs } from '../config';

@Injectable()
export class LogService {
  sendNotificationSlack(req: Request, status: HttpStatus, except: any) {
    const slackTransport = new SlackHook({
      webhookUrl: envs.slackWebhookUrl,
      format: format.json(),
    });

    const logger = createLogger({ transports: [slackTransport] });

    const messageLog = `
      \nMethod: ${req.method}
      \nPath: ${req.url}
      \nStatus: ${status}
      \nError: ${except.message}
      \nStack: ${except.stack}
      \n Headers: ${JSON.stringify(req.headers)}
      \n Body: ${JSON.stringify(req.body)}`;

    logger.error(messageLog);
  }

  saveFileLog(req: Request, res: Response) {
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

    const fileErrorTransport = new transports.File({
      filename: `logs/${formattedDate}-info.log`,
      format: format.combine(format.json()),
    });

    const logger = createLogger({ transports: [fileErrorTransport] });

    const messageLog = `Method: ${req.method}, User ID: ${req['user']?.id}, Time: ${date.toISOString()}, Path: ${req.path}, Status: ${res.statusCode}`;

    logger.info(messageLog);
  }
}
