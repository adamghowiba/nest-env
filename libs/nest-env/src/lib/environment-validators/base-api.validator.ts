import { Transform } from 'class-transformer';
import { IsEnum, IsNumber } from 'class-validator';

export enum EnvironmentMap {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
}
export type Environment = `${EnvironmentMap}`;

export class BasesApiEnvironmentVariables {
  @IsEnum(EnvironmentMap)
  NODE_ENV!: Environment;

  @IsNumber()
  @Transform(({ value }) => +value)
  PORT!: number;
}
