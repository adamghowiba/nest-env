import { Controller, Get } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import {
  AppEnvironmentVariables
} from '../configuration/app.environment';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly config: ConfigService<AppEnvironmentVariables>
  ) {}

  @Get()
  getData() {
    return this.config.get('DATABASE_HOST');
  }
}
