declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    PORT: string | undefined;
    DATABASE_URL: string;
    SLACK_WEBHOOK_URL: string;
    JWT_SECRET;
    SUPER_USER_SECRET;
    DEFAULT_USER_NAME;
    DEFAULT_USER_LAST_NAME;
    DEFAULT_USER_EMAIL;
    DEFAULT_USER_PHON;
  }
}
