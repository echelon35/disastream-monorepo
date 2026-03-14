import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EarthquakeModule } from './Modules/earthquake.module';
import { FloodModule } from './Modules/flood.module';
import { HurricaneModule } from './Modules/hurricane.module';
import { EruptionModule } from './Modules/eruption.module';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import {
  Alea,
  Earthquake,
  Source,
  Flood,
  Hurricane,
  Eruption,
  City,
} from '@disastream/models';

import { CustomLogger } from './Application/logger.service';
import { NotifierService } from './Application/notifier.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DISASTER_EATER_DB_HOST,
      port: parseInt(process.env.DISASTER_EATER_DB_PORT),
      username: process.env.DISASTER_EATER_DB_USER,
      password: process.env.DISASTER_EATER_DB_PASSWORD,
      database: process.env.DISASTER_EATER_DB_NAME,
      entities: [Alea, Earthquake, Source, Flood, Hurricane, Eruption, City],
      schema: 'public',
    }),
    ScheduleModule.forRoot(),
    EarthquakeModule,
    FloodModule,
    HurricaneModule,
    EruptionModule,
    HttpModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CustomLogger,
    NotifierService
  ],
})
export class AppModule { }
