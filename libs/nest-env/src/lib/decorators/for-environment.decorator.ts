/* eslint-disable @typescript-eslint/ban-types */
import { applyDecorators } from '@nestjs/common';
import { ValidateIf } from 'class-validator';
import { LiteralUnion } from '../types/literal-union';

/**
 * Only validates the property for a given application environment (APPLICATION_ENV).
 * Helpful when working with tools like NX which replaced NODE_ENV
 * @param applicationEnvironment Application environment to check for
 *
 * @example ```ts
 *  @ForApplicationEnvironment('staging')
 * ```
 */
export const ForApplicationEnvironment = (
  applicationEnvironment: string | string[]
) => {
  return applyDecorators(
    ValidateIf((object, value) => {
      const currentApplicationEnv = process.env['APPLICATION_ENV'];

      if (!currentApplicationEnv) return true;

      if (Array.isArray(applicationEnvironment))
        return applicationEnvironment
          .map((env) => env.toLowerCase())
          .includes(currentApplicationEnv.toLowerCase());

      return (
        currentApplicationEnv.toLowerCase() ===
        applicationEnvironment.toLowerCase()
      );
    })
  );
};

export type ForNodeEnvironmentUnion = LiteralUnion<
  'development' | 'production',
  string
>;

/**
 * Only validates the property for a given node environment (NODE_ENV)
 * @param applicationEnvironment Application environment to check for
 */
export const ForNodeEnvironment = (
  nodeEnvironment: ForNodeEnvironmentUnion | ForNodeEnvironmentUnion[]
) => {
  return applyDecorators(
    ValidateIf((object, value) => {
      const currentNodeEnv = process.env['NODE_ENV'];

      if (!currentNodeEnv) return true;

      if (Array.isArray(nodeEnvironment))
        return nodeEnvironment
          .map((env) => env.toLowerCase())
          .includes(currentNodeEnv.toLowerCase());

      return nodeEnvironment.toLowerCase() === currentNodeEnv.toLowerCase();
    })
  );
};
