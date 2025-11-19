import { registerAs } from '@nestjs/config';

export interface AppConfig {
  nodeEnv: string;
  port: number;
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
  };
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessTtl: string;
    refreshTtl: string;
  };
  mail: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
  };
  appUrl: string;
  emailTokenTtlMinutes: number;
  resetTokenTtlMinutes: number;
}

export default registerAs<AppConfig>('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3333', 10),
  database: {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    user: process.env.DATABASE_USER ?? 'madamcoco',
    password: process.env.DATABASE_PASSWORD ?? 'madamcoco',
    name: process.env.DATABASE_NAME ?? 'madamcoco',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret',
    accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL ?? '30d',
  },
  mail: {
    host: process.env.MAIL_HOST ?? 'localhost',
    port: parseInt(process.env.MAIL_PORT ?? '1025', 10),
    user: process.env.MAIL_USER ?? '',
    pass: process.env.MAIL_PASSWORD ?? '',
    from: process.env.MAIL_FROM ?? 'no-reply@madamcoco.local',
  },
  appUrl: process.env.APP_URL ?? 'http://localhost:4200',
  emailTokenTtlMinutes: parseInt(process.env.EMAIL_CONFIRM_TTL ?? '60', 10),
  resetTokenTtlMinutes: parseInt(process.env.RESET_TOKEN_TTL ?? '30', 10),
}));

