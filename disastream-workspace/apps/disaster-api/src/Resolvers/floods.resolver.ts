import { ParseIntPipe } from '@nestjs/common';
import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { FloodsService } from 'src/Application/floods.service';
import { Flood } from 'src/Domain/Model/flood.entity';

@Resolver()
export class FloodsResolver {
  constructor(private readonly floodService: FloodsService) {}

  @Query(() => [Flood], { name: 'floods' })
  async FindAll() {
    return this.floodService.findAll();
  }

  @Query(() => Flood, { name: 'flood' })
  async FindOne(@Args('id', { type: () => ID }, ParseIntPipe) id: number) {
    return this.floodService.findOne(id);
  }
}
