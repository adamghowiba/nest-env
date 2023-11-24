export { AWSEnvironmentVariables } from './lib/environment-validators/aws.validator';

export {
  BasesApiEnvironmentVariables,
  Environment,
  EnvironmentMap,
} from './lib/environment-validators/base-api.validator';

export {
  ForApplicationEnvironment,
  ForNodeEnvironment,
} from './lib/decorators/for-environment.decorator';
export type { ForNodeEnvironmentUnion } from './lib/decorators/for-environment.decorator';

export { EnvironmentModule } from './lib/environment.module';
export type {
  EnvironmentModuleParams,
  EnableValidatorsOptions,
} from './lib/environment.module';

export type { LiteralUnion } from './lib/types/literal-union';
export type { Primitive } from './lib/types/primitive';
