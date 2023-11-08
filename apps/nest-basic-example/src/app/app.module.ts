import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  appConfig
} from '../configuration/app.environment';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // EnvironmentModule.forRoot({
    //   environmentVariables: [AppEnvironmentVariables],
    // }),
    ConfigModule.forRoot({
      load: [appConfig],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
