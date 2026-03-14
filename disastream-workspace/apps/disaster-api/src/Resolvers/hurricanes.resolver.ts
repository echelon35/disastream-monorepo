import { ParseIntPipe } from '@nestjs/common';
import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { HurricanesService } from 'src/Application/hurricanes.service';
import { Hurricane } from 'src/Domain/Model/hurricane.entity';

@Resolver()
export class HurricanesResolver {
  constructor(private readonly hurricaneService: HurricanesService) {}

  @Query(() => [Hurricane], { name: 'hurricanes' })
  async FindAll() {
    return this.hurricaneService.findAll();
  }

  @Query(() => Hurricane, { name: 'hurricane' })
  async FindOne(@Args('id', { type: () => ID }, ParseIntPipe) id: number) {
    return this.hurricaneService.findOne(id);
  }
}
