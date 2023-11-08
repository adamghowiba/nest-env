/* eslint-disable @typescript-eslint/ban-types */
import { applyDecorators } from '@nestjs/common';
import { ValidateIf } from 'class-validator';

/**
 * Only validates the property for s given application environment (APPLICATION_ENV)
 * @param applicationEnvironment Application environment to check for
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

/**
 * Only validates the property for a given node environment (NODE_ENV)
 * @param applicationEnvironment Application environment to check for
 */
export const ForNodeEnvironment = (
  nodeEnvironment: string | string[]
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
