import { config } from 'dotenv';
import * as joi from 'joi';
import { resolve } from 'path';
import { ExecModes } from '@common/enums';

const nodeEnv = process.env.NODE_ENV.trim() || ExecModes.LOCAL;

const envFile = nodeEnv === ExecModes.PROD ? '.env' : `.env.${nodeEnv}`;

const envPath = resolve(process.cwd(), envFile);

config({ path: envPath });

interface EnvVars {
  PORT: number;
  NODE_ENV: string;
  DATABASE_URL: string;
  SLACK_WEBHOOK_URL: string;
  JWT_SECRET: string;
  SECRET_KEY: string;
  EXPIRES_IN: string;

  SUPER_USER_SECRET: string;
  DEFAULT_USER_NAME: string;
  DEFAULT_USER_LAST_NAME: string;
  DEFAULT_USER_EMAIL: string;
  DEFAULT_USER_PHONE: string;
  DEFAULT_USER_PASSWORD: string;

  USER_NOTIFICATIONS: string;
  PASSWORD_NOTIFICATIONS: string;
}

const envSchema = joi
  .object({
    PORT: joi.number().default(3000),
    NODE_ENV: joi.string().required().trim(),
    DATABASE_URL: joi.string().required(),
    SLACK_WEBHOOK_URL: joi.string().required(),
    JWT_SECRET: joi.string().required(),
    EXPIRES_IN: joi.string().required(),
    SECRET_KEY: joi.string().required(),

    SUPER_USER_SECRET: joi.string().required(),
    DEFAULT_USER_NAME: joi.string().required(),
    DEFAULT_USER_LAST_NAME: joi.string().required(),
    DEFAULT_USER_EMAIL: joi.string().required(),
    DEFAULT_USER_PHONE: joi.string().required(),
    DEFAULT_USER_PASSWORD: joi.string().required(),

    USER_NOTIFICATIONS: joi.string().required(),
    PASSWORD_NOTIFICATIONS: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envSchema.validate(process.env, { abortEarly: false });

if (error) {
  const errorMessages = error.details
    .map((detail) => detail.message)
    .join(',\n');

  throw new Error(`Config validation error: ${errorMessages}`);
}

const envVars: EnvVars = value as EnvVars;

export const envs = {
  port: envVars.PORT,
  nodeEnv: envVars.NODE_ENV,
  databaseUrl: envVars.DATABASE_URL,
  slackWebhookUrl: envVars.SLACK_WEBHOOK_URL,

  jwtSecret: envVars.JWT_SECRET,
  expiresIn: envVars.EXPIRES_IN,
  secretKey: envVars.SECRET_KEY,
  superUserSecret: envVars.SUPER_USER_SECRET,
  defaultUserName: envVars.DEFAULT_USER_NAME,
  defaultUserLastName: envVars.DEFAULT_USER_LAST_NAME,
  defaultUserEmail: envVars.DEFAULT_USER_EMAIL,
  defaultUserPhone: envVars.DEFAULT_USER_PHONE,
  defaultUserPassword: envVars.DEFAULT_USER_PASSWORD,

  userNotifications: envVars.USER_NOTIFICATIONS,
  passwordNotifications: envVars.PASSWORD_NOTIFICATIONS,
};
