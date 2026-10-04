declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    PORT: string | undefined;
    DATABASE_URL: string;
    SLACK_WEBHOOK_URL: string;
    ALLOWED_ORIGINS: string;
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
    MERCADO_PAGO_PUBLIC_KEY: string;
    MERCADO_PAGO_ACCESS_TOKEN: string;
    MERCADO_PAGO_WEBHOOK_TOKEN: string;
    MERCADO_PAGO_URL_WEBHOOK: string;
  }
}