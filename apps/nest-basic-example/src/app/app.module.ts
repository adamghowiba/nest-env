import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  AppEnvironmentVariables,
  appConfig
} from '../configuration/app.environment';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvironmentModule } from '@agkit/nest-env';

@Module({
  imports: [
    EnvironmentModule.forRoot({
      environmentVariables: [AppEnvironmentVariables],
    }),
    // ConfigModule.forRoot({
    //   load: [appConfig],
    // }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
