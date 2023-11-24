/* eslint-disable @typescript-eslint/no-explicit-any */
import { IsString, MinLength } from 'class-validator';
import {
  ClassConstructor,
  Transform,
  plainToInstance,
} from 'class-transformer';
import { validateAll, validateWithoutThrowing } from '../validator';
import 'reflect-metadata';
import { EnvironmentVariablesNotFoundError } from '../errors/environment-variable-not-found.error';

class ApplicationEnvironment {
  @IsString()
  @MinLength(10)
  DATABASE_URL!: string;
}

class AWsEnvironment {
  @IsString()
  @Transform((params) => 'transformed')
  PROFILE!: string;
}

const VALID_DATABASE_URL = 'postgres://test@localhost';
const VALID_PROFILE = 'agkit';

describe('validateWithoutThrowing', () => {
  describe('Given valid config and validatorConstructor', () => {
    it('should return status "success" with validatedConfig', () => {
      const validate = validateWithoutThrowing(
        { DATABASE_URL: 'postgres://test@localhost' },
        ApplicationEnvironment as ClassConstructor<any>
      );

      expect(validate.status).toBe('success');
    });
  });

  describe('Given invalid config', () => {
    it('should return status "fail" with string required errorMessages', () => {
      const validate = validateWithoutThrowing(
        { DATABASE_URL: '' },
        ApplicationEnvironment as ClassConstructor<any>
      );

      const errorMessage =
        validate.status === 'fail' ? validate.errorMessages : [];

      expect(validate.status).toBe('fail');
      expect(errorMessage.length).toBe(1);
      expect(errorMessage[0].startsWith('DATABASE_URL has failed')).toBe(true);
    });
  });
});

describe('validateAll', () => {
  describe('Given valid configs for all validatorConstructors', () => {
    it('should combine and return validated configs', () => {
      const config = validateAll(
        { DATABASE_URL: VALID_DATABASE_URL, PROFILE: VALID_PROFILE },
        [
          ApplicationEnvironment as ClassConstructor<any>,
          AWsEnvironment as ClassConstructor<any>,
        ]
      );

      expect(config).toHaveProperty('DATABASE_URL');
      expect(config).toHaveProperty('PROFILE');
    });

    it('should combine and return transformed  configs', () => {
      const config = validateAll(
        { DATABASE_URL: VALID_DATABASE_URL, PROFILE: VALID_PROFILE },
        [
          ApplicationEnvironment as ClassConstructor<any>,
          AWsEnvironment as ClassConstructor<any>,
        ]
      );

      expect(config).toHaveProperty('DATABASE_URL');
      expect(config).toHaveProperty('PROFILE', 'transformed');
    });
  });

  describe('Given some invalid configs', () => {
    it('should throw EnvironmentVariablesNotFoundError with error messages', () => {
      const validation = () =>
        validateAll({ PROFILE: VALID_PROFILE }, [
          ApplicationEnvironment as ClassConstructor<any>,
          AWsEnvironment as ClassConstructor<any>,
        ]);

      expect(validation).toThrow(EnvironmentVariablesNotFoundError);
    });

    it('should return an empty object', () => {
      const config = validateAll(
        { DATABASE_URL: VALID_DATABASE_URL, PROFILE: VALID_PROFILE },
        []
      );

      expect(config).toEqual({});
    });
  });
});
