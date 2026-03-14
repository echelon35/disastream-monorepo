import { ParseIntPipe } from '@nestjs/common';
import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { EarthquakesService } from 'src/Application/earthquakes.service';
import { Earthquake } from 'src/Domain/Model/earthquake.entity';

@Resolver()
export class EarthquakesResolver {
  constructor(private readonly earthquakeService: EarthquakesService) {}

  @Query(() => [Earthquake], { name: 'earthquakes' })
  async FindAll() {
    return this.earthquakeService.findAll();
  }

  @Query(() => Earthquake, { name: 'earthquake' })
  async FindOne(@Args('id', { type: () => ID }, ParseIntPipe) id: number) {
    return this.earthquakeService.findOne(id);
  }
}
