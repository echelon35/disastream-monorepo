import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GdacsService } from '../Application/gdacs.service';
import { SourceService } from '../Application/source.service';
import { EruptionController } from '../Controllers/eruption.controller';
import { EruptionJob } from '../Cron/eruption_job.service';
import { Eruption, Source } from '@disastream/models';
import { NotifierModule } from '../Modules/notifier.module';
import { CityModule } from '../Modules/city.module';
import { LoggerModule } from '../Modules/logger.module';
import { GenericEater } from '../Application/generic_eater.service';
import { CustomLogger } from '../Application/logger.service';
import { DataSource } from 'typeorm';
import { CityService } from '../Application/city.service';
import { GenericJob } from '../Cron/generic_job.service';
import { GdacsEruptionProvider } from '../Application/gdacs-providers.service';
import { EruptionSubscriber } from '../Infrastructure/Subscribers/disaster.subscribers';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Source, Eruption]),
    LoggerModule,
    NotifierModule,
    CityModule,
  ],
  controllers: [EruptionController],
  providers: [
    SourceService,
    GdacsService,
    EruptionJob,
    GdacsEruptionProvider,
    EruptionSubscriber,
    {
      provide: 'EruptionGenericEater',
      useFactory: (logger: CustomLogger, dataSource: DataSource, cityService: CityService) => {
        return new GenericEater<Eruption>(Eruption, logger, dataSource, cityService);
      },
      inject: [CustomLogger, DataSource, CityService]
    },
    {
      provide: 'EruptionGenericJob',
      useFactory: (eater: GenericEater<Eruption>, gdacsProvider: GdacsEruptionProvider) => {
        return new GenericJob<Eruption>(eater, [gdacsProvider]);
      },
      inject: ['EruptionGenericEater', GdacsEruptionProvider]
    }
  ],
})
export class EruptionModule { }
