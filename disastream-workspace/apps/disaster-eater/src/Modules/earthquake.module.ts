import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GdacsService } from '../Application/gdacs.service';
import { SourceService } from '../Application/source.service';
import { UsgsService } from '../Application/usgs.service';
import { EarthquakeController } from '../Controllers/earthquake.controller';
import { EarthquakeJob } from '../Cron/earthquake_job.service';
import { Earthquake, Source } from '@disastream/models';
import { NotifierModule } from './notifier.module';
import { CityModule } from './city.module';
import { LoggerModule } from './logger.module';
import { GenericEater } from '../Application/generic_eater.service';
import { CustomLogger } from '../Application/logger.service';
import { DataSource } from 'typeorm';
import { CityService } from '../Application/city.service';
import { GenericJob } from '../Cron/generic_job.service';
import { GdacsEarthquakeProvider } from '../Application/gdacs-providers.service';
import { EarthquakeSubscriber } from '../Infrastructure/Subscribers/disaster.subscribers';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Source, Earthquake]),
    LoggerModule,
    NotifierModule,
    CityModule,
  ],
  controllers: [EarthquakeController],
  providers: [
    UsgsService,
    SourceService,
    GdacsService,
    EarthquakeJob,
    GdacsEarthquakeProvider,
    EarthquakeSubscriber,
    {
      provide: 'EarthquakeGenericEater',
      useFactory: (logger: CustomLogger, dataSource: DataSource, cityService: CityService) => {
        return new GenericEater<Earthquake>(Earthquake, logger, dataSource, cityService);
      },
      inject: [CustomLogger, DataSource, CityService]
    },
    {
      provide: 'EarthquakeGenericJob',
      useFactory: (eater: GenericEater<Earthquake>, usgsProvider: UsgsService, gdacsProvider: GdacsEarthquakeProvider) => {
        return new GenericJob<Earthquake>(eater, [usgsProvider, gdacsProvider]);
      },
      inject: ['EarthquakeGenericEater', UsgsService, GdacsEarthquakeProvider]
    }
  ],
})
export class EarthquakeModule { }
