import { ClassConstructor, plainToInstance } from 'class-transformer';
import { ValidationError, validateSync } from 'class-validator';
import { EnvironmentVariablesNotFoundError } from './errors/environment-variable-not-found.error';

/**
 * Formats class validator error messages into a more manageable and readable format
 *
 * @example message format
 * ```txt
 *  -  property ENV has failed the following constraints: max, isNumber
 *     - OASES_DB_PASSWORD must not be greater than 1
 *     - OASES_DB_PASSWORD must be a number conforming to the specified constraints
 * ```
 * @param errors
 * @returns
 */
const formatErrorMessages = (errors: ValidationError[]) => {
  return errors.reduce((acc: string[], error) => {
    const { target, ...rest } = error;

    let errorMessage = '';
    if (error.constraints) {
      const errorMessageParts = `${Object.values(error.constraints).map(
        (constraint) => `\n  - ${constraint}`
      )}`;
      const constraintKeys = Object.keys(error.constraints);

      errorMessage = `${
        rest.property
      } has failed with the following constraints: ${constraintKeys.join(
        ', '
      )} ${errorMessageParts}\n\n`;
    } else {
      errorMessage = `${rest.property} has failed validation`;
    }

    acc.push(errorMessage);

    return acc;
  }, []);
};

/**
 * Validates a single class constructor against the environment variables
 * without throwing an error. Only returns error messages, or transformed validatorConstructor
 * @param config Environment variables to validate against
 * @param validatorConstructor - Class validator constructor
 * @returns Error messages as an array for failed validations
 * @returns Transformed environmentVariables for successful validation
 */
export function validateWithoutThrowing<T extends ClassConstructor<T>>(
  config: Record<string, unknown>,
  validatorConstructor: T
):
  | { status: 'success'; validatedConfig: T }
  | { status: 'fail'; errorMessages: string[] } {
  const validatedConfig = plainToInstance(validatorConstructor, config, {
    enableImplicitConversion: true,
    exposeDefaultValues: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
    stopAtFirstError: false,
    whitelist: true,
  });

  const formattedErrorMessage = formatErrorMessages(errors);

  if (errors.length > 0) {
    return { status: 'fail', errorMessages: formattedErrorMessage };
  }

  return { status: 'success', validatedConfig: validatedConfig };
}

/**
 * Validates environment variables against an array of validator constructors
 * @param config Environment variables
 * @param validatorConstructor Array or single class validator constructor
 * @returns `failedConstructors` & `validationErrorMessages`
 * @returns Transformed environmentVariables for successful validation
 */
export function validateAll<T extends ClassConstructor<T>>(
  config: Record<string, unknown>,
  validatorConstructor: T[]
) {
  const validationOutput = validatorConstructor.reduce(
    (
      acc: {
        failedConstructors: string[];
        errorMessages: string[];
        validatedConfigs: any[];
      },
      validatorClass
    ) => {
      const validation = validateWithoutThrowing(config, validatorClass);

      if (validation.status === 'fail' && validation.errorMessages.length) {
        acc.errorMessages.push(...validation.errorMessages);
        acc.failedConstructors.push(validatorClass.name);
        return acc;
      }

      if (validation.status === 'success') {
        acc.validatedConfigs.push(validation.validatedConfig);
      }

      return acc;
    },
    { failedConstructors: [], errorMessages: [], validatedConfigs: [] }
  );

  if (validationOutput.errorMessages.length) {
    throw new EnvironmentVariablesNotFoundError(
      `Environment variables failed validation (${validationOutput.failedConstructors.join(
        ', '
      )})\n\n` + validationOutput.errorMessages.join('').toString()
    );
  }

  const combinedConfigs = Object.assign(
    {},
    ...validationOutput.validatedConfigs
  );

  return combinedConfigs
}
