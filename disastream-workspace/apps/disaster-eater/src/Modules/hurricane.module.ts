import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GdacsService } from '../Application/gdacs.service';
import { SourceService } from '../Application/source.service';
import { HurricaneController } from '../Controllers/hurricane.controller.';
import { HurricaneJob } from '../Cron/hurricane_job.service';
import { Hurricane, Source } from '@disastream/models';
import { NotifierModule } from '../Modules/notifier.module';
import { CityModule } from '../Modules/city.module';
import { LoggerModule } from '../Modules/logger.module';
import { GenericEater } from '../Application/generic_eater.service';
import { CustomLogger } from '../Application/logger.service';
import { DataSource } from 'typeorm';
import { CityService } from '../Application/city.service';
import { GenericJob } from '../Cron/generic_job.service';
import { GdacsHurricaneProvider } from '../Application/gdacs-providers.service';
import { HurricaneSubscriber } from '../Infrastructure/Subscribers/disaster.subscribers';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Source, Hurricane]),
    LoggerModule,
    NotifierModule,
    CityModule,
  ],
  controllers: [HurricaneController],
  providers: [
    SourceService,
    GdacsService,
    HurricaneJob,
    GdacsHurricaneProvider,
    HurricaneSubscriber,
    {
      provide: 'HurricaneGenericEater',
      useFactory: (logger: CustomLogger, dataSource: DataSource, cityService: CityService) => {
        return new GenericEater<Hurricane>(Hurricane, logger, dataSource, cityService);
      },
      inject: [CustomLogger, DataSource, CityService]
    },
    {
      provide: 'HurricaneGenericJob',
      useFactory: (eater: GenericEater<Hurricane>, gdacsProvider: GdacsHurricaneProvider) => {
        return new GenericJob<Hurricane>(eater, [gdacsProvider]);
      },
      inject: ['HurricaneGenericEater', GdacsHurricaneProvider]
    }
  ],
})
export class HurricaneModule { }
