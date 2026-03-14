import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GdacsService } from '../Application/gdacs.service';
import { SourceService } from '../Application/source.service';
import { FloodController } from '../Controllers/flood.controller';
import { FloodJob } from '../Cron/flood_job.service';
import { Flood, Source } from '@disastream/models';
import { NotifierModule } from '../Modules/notifier.module';
import { CityModule } from '../Modules/city.module';
import { LoggerModule } from '../Modules/logger.module';
import { GenericEater } from '../Application/generic_eater.service';
import { CustomLogger } from '../Application/logger.service';
import { DataSource } from 'typeorm';
import { CityService } from '../Application/city.service';
import { GenericJob } from '../Cron/generic_job.service';
import { GdacsFloodProvider } from '../Application/gdacs-providers.service';
import { FloodSubscriber } from '../Infrastructure/Subscribers/disaster.subscribers';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Source, Flood]),
    LoggerModule,
    NotifierModule,
    CityModule,
  ],
  controllers: [FloodController],
  providers: [
    SourceService,
    GdacsService,
    FloodJob,
    FloodSubscriber,
    GdacsFloodProvider,
    {
      provide: 'FloodGenericEater',
      useFactory: (logger: CustomLogger, dataSource: DataSource, cityService: CityService) => {
        return new GenericEater<Flood>(Flood, logger, dataSource, cityService);
      },
      inject: [CustomLogger, DataSource, CityService]
    },
    {
      provide: 'FloodGenericJob',
      useFactory: (eater: GenericEater<Flood>, gdacsProvider: GdacsFloodProvider) => {
        return new GenericJob<Flood>(eater, [gdacsProvider]);
      },
      inject: ['FloodGenericEater', GdacsFloodProvider]
    }
  ],
})
export class FloodModule { }
