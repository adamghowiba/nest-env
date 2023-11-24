/* eslint-disable @typescript-eslint/no-explicit-any */
import { DynamicModule, Module } from '@nestjs/common';
import {
  ConfigModule,
  ConfigModuleOptions,
  ConfigService,
} from '@nestjs/config';
import { ClassConstructor } from 'class-transformer';
import { AWSEnvironmentVariables } from './environment-validators/aws.validator';
import { validateAll } from './validator';
import { BasesApiEnvironmentVariables } from './environment-validators/base-api.validator';

export interface EnableValidatorsOptions {
  /**
   * Standard AWS environment variables
   * @default false
   */
  awsValidation?: boolean;
  /**
   * Standard Zoho environment variables
   * @default false
   */
  zohoValidation?: boolean;
  /**
   * Standard API environment variables. Enabled by default
   *
   * @default true
   * @example
   * - PORT
   * - APPLICATION_ENV
   * - NODE_ENV
   */
  defaultApiValidation?: boolean;
}

export interface EnvironmentModuleParams<T = any>
  extends Omit<ConfigModuleOptions, 'isGlobal' | 'validate'> {
  environmentVariables?: ClassConstructor<T>[] | ClassConstructor<T>;
  /**
   * List of default validators to enable or disable
   */
  enableDefaultValidators?: EnableValidatorsOptions;
  isGlobal?: boolean;
}

@Module({})
export class EnvironmentModule {
  static forRoot({
    isGlobal = true,
    ...params
  }: EnvironmentModuleParams): DynamicModule {
    const module: DynamicModule = {
      global: isGlobal,
      module: EnvironmentModule,
      providers: [ConfigService],
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['.env.local', '.env.development', '.env'],
          isGlobal: isGlobal,
          validate: (config) => {
            const getEnvironmentValidators =
              getEnvironmentVariablesWithDefaults(params);

            return validateAll(config, getEnvironmentValidators);
          },
          ...params,
        }),
      ],
      exports: [ConfigService],
    };

    return module;
  }
}

/**
 * Gets a unique list of environment validator class constructors with defaults.
 * @param params
 * @returns
 */
const getEnvironmentVariablesWithDefaults = (
  params: Pick<
    EnvironmentModuleParams,
    'enableDefaultValidators' | 'environmentVariables'
  >
) => {
  const environmentValidators = new Set<ClassConstructor<any>>();

  if (params.enableDefaultValidators?.awsValidation)
    environmentValidators.add(AWSEnvironmentVariables);
  if (params.enableDefaultValidators?.defaultApiValidation)
    environmentValidators.add(BasesApiEnvironmentVariables);

  if (!params.environmentVariables) return Array.from(environmentValidators);

  if (Array.isArray(params.environmentVariables)) {
    params.environmentVariables.forEach((validator) =>
      environmentValidators.add(validator)
    );

    return Array.from(environmentValidators);
  }

  environmentValidators.add(params.environmentVariables);

  return Array.from(environmentValidators);
};
