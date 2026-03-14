import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from '@disastream/models';
import { CityService } from '../Application/city.service';
import { Repository } from 'typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([City])],
  providers: [Repository<City>, CityService],
  exports: [CityService],
})
export class CityModule { }
