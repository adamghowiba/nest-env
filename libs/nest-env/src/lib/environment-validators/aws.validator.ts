import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class AWSEnvironmentVariables {
  @IsString()
  @IsOptional()
  AWS_PROFILE!: string;
}
