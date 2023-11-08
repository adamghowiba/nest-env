/* eslint-disable @typescript-eslint/ban-types */
import { IsEnum, IsString } from 'class-validator';

export enum ApplicationEnvironment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

export class AppEnvironmentVariables {
  @IsEnum(ApplicationEnvironment)
  APP_ENV!: ApplicationEnvironment;

  @IsString()
  DATABASE_HOST!: string;
}

export const appConfig = () => ({
  PORT: parseInt(process.env['PORT'] as string, 10) || 3000,
  database: {
    host: 'some host',
  },
});

export const config = appConfig();
