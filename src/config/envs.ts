import { config } from 'dotenv';
import joi from 'joi';
import { resolve } from 'path';

import { ExecModes } from '@common/enums';

const nodeEnv = (process.env.NODE_ENV?.trim() as ExecModes) || ExecModes.LOCAL;

const envFile = nodeEnv === ExecModes.PROD ? '.env' : `.env.${nodeEnv}`;

const envPath = resolve(process.cwd(), envFile);

config({ path: envPath });

interface EnvVars {
  PORT: number;
  NODE_ENV: ExecModes;

  DB_URL: string;

  JWT_SECRET: string;
  JWT_EXPIRATION: string;

  DISCORD_WEBHOOK_URL: string;

  NOTIFICATION_EMAIL: string;
  PASSWORD_EMAIL: string;

  ALLOWED_ORIGINS: string[];

  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;
  REDIS_CACHE_EXPIRATION: number;

  PAYMENT_PUBLIC_KEY: string;
  PAYMENT_PRIVATE_KEY: string;
  PAYMENT_KEY_SIGNATURE: string;
  PAYMENT_URL_CONFIRMATION: string;
}

export const envSchema = joi
  .object({
    PORT: joi.number().default(3000),
    NODE_ENV: joi
      .string()
      .valid(...Object.values(ExecModes))
      .default(ExecModes.LOCAL),

    DB_URL: joi.string().required(),

    JWT_SECRET: joi.string().required(),
    JWT_EXPIRATION: joi.string().required(),

    NOTIFICATION_EMAIL: joi.string().email().required(),
    PASSWORD_EMAIL: joi.string().required(),

    ALLOWED_ORIGINS: joi.array().items(joi.string().uri()).required(),

    REDIS_HOST: joi.string().required(),
    REDIS_PORT: joi.number().required(),
    REDIS_PASSWORD: joi.string().required(),
    REDIS_CACHE_EXPIRATION: joi.number().default(3600), // Default to 1 hour

    PAYMENT_PUBLIC_KEY: joi.string().required(),
    PAYMENT_PRIVATE_KEY: joi.string().required(),
    PAYMENT_KEY_SIGNATURE: joi.string().required(),
    PAYMENT_URL_CONFIRMATION: joi.string().uri().required(),
  })
  .unknown(true);

const result = envSchema.validate(
  { ...process.env, ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') },
  { abortEarly: false, allowUnknown: false },
);

const error = result.error;
const value = result.value as EnvVars;

if (error) throw new Error(`Config validation error: \n ${error.message}`);

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  nodeEnv,

  dbUrl: envVars.DB_URL,

  jwtSecret: envVars.JWT_SECRET,
  jwtExpiration: envVars.JWT_EXPIRATION,

  discordWebhookUrl: envVars.DISCORD_WEBHOOK_URL,

  notificationEmail: envVars.NOTIFICATION_EMAIL,
  passwordEmail: envVars.PASSWORD_EMAIL,

  allowedOrigins: envVars.ALLOWED_ORIGINS,

  redisHost: envVars.REDIS_HOST,
  redisPort: envVars.REDIS_PORT,
  redisPassword: envVars.REDIS_PASSWORD,
  redisCacheExpiration: envVars.REDIS_CACHE_EXPIRATION,

  paymentPublicKey: envVars.PAYMENT_PUBLIC_KEY,
  paymentPrivateKey: envVars.PAYMENT_PRIVATE_KEY,
  paymentKeySignature: envVars.PAYMENT_KEY_SIGNATURE,
  paymentUrlConfirmation: envVars.PAYMENT_URL_CONFIRMATION,
};
