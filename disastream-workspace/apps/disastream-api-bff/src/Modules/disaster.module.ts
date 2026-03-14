import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  City,
  Country,
  Earthquake,
  Eruption,
  Flood,
  Hurricane,
} from '@disastream/models';
import { CityController } from '../Controllers/city.controller';
import { CountryController } from '../Controllers/countries.controller';
import { CityService } from '../Services/city.service';
import { CountryService } from '../Services/country.service';
import { DisasterService } from '../Services/disaster.service';
import { Repository } from 'typeorm';
import { StrategyModule } from './strategy.module';

@Module({
  providers: [
    Repository<Earthquake>,
    Repository<Hurricane>,
    Repository<Flood>,
    Repository<Eruption>,
    Repository<City>,
    Repository<Country>,
    DisasterService,
    CityService,
    CountryService,
  ],
  imports: [
    StrategyModule,
    TypeOrmModule.forFeature(
      [Earthquake, City, Hurricane, Eruption, Flood, Country],
      'DisasterDb',
    ),
  ],
  exports: [DisasterService, CityService],
  controllers: [CityController, CountryController],
})
export class DisasterModule { }
