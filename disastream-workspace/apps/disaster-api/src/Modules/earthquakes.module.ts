import { Module } from '@nestjs/common';
import { EarthquakesResolver } from '../Resolvers/earthquakes.resolver';
import { EarthquakesService } from '../Application/earthquakes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Earthquake } from 'src/Domain/Model/earthquake.entity';
import { Source } from 'src/Domain/Model/source.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Earthquake, Source])],
  providers: [EarthquakesResolver, EarthquakesService],
})
export class EarthquakesModule {}
