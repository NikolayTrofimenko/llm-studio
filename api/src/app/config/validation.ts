import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsEnum(['development', 'production', 'test'], {
    message: 'NODE_ENV must be development, production or test',
  })
  NODE_ENV!: 'development' | 'production' | 'test';

  @IsString()
  @IsOptional()
  PORT?: string;

  @IsString()
  @IsOptional()
  DATABASE_HOST?: string;

  @IsNumber()
  @IsOptional()
  DATABASE_PORT?: number;

  @IsString()
  @IsOptional()
  DATABASE_USER?: string;

  @IsString()
  @IsOptional()
  DATABASE_PASSWORD?: string;

  @IsString()
  @IsOptional()
  DATABASE_NAME?: string;

  @IsString()
  @IsOptional()
  JWT_ACCESS_SECRET?: string;

  @IsString()
  @IsOptional()
  JWT_REFRESH_SECRET?: string;

  @IsString()
  @IsOptional()
  JWT_ACCESS_TTL?: string;

  @IsString()
  @IsOptional()
  JWT_REFRESH_TTL?: string;

  @IsString()
  @IsOptional()
  MAIL_FROM?: string;

  @IsString()
  @IsOptional()
  MAIL_HOST?: string;

  @IsString()
  @IsOptional()
  MAIL_PORT?: string;

  @IsString()
  @IsOptional()
  MAIL_USER?: string;

  @IsString()
  @IsOptional()
  MAIL_PASSWORD?: string;

  @IsString()
  @IsOptional()
  APP_URL?: string;

  @IsString()
  @IsOptional()
  EMAIL_CONFIRM_TTL?: string;

  @IsString()
  @IsOptional()
  RESET_TOKEN_TTL?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}

