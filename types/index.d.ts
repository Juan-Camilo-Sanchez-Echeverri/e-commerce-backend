//NodeJS.ProcessEnv

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    PORT: string | undefined;
    DATABASE_URL: string;
    SLACK_WEBHOOK_URL: string;
    WHATSAPP_TOKEN: string;
    WHATSAPP_URL;
    JWT_SECRET;
    SG_API_KEY;
    SG_MAIL;
    AWS_SECRET_ACCESS_KEY;
    AWS_ACCESS_KEY_ID;
    AWS_S3_BUCKET_NAME;
    AWS_S3_REGION;
    SUPER_USER_SECRET;
    DEFAULT_USER_NAME;
    DEFAULT_USER_LAST_NAME;
    DEFAULT_USER_EMAIL;
    DEFAULT_USER_PHON;
    EPAYCO_PUBLIC_KEY;
    EPAYCO_PRIVATE_KEY;
  }
}
