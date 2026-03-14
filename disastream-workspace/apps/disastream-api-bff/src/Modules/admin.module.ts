import { Module } from '@nestjs/common';
import { AdminController } from '../Controllers/admin.controller';
import { CityService } from '../Services/city.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { City, Country } from '@disastream/models';
import { CountryService } from '../Services/country.service';

@Module({
  imports: [TypeOrmModule.forFeature([City, Country], 'DisasterDb')],
  providers: [CityService, CountryService],
  controllers: [AdminController],
})
export class AdminModule { }
