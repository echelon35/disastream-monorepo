import { ParseIntPipe } from '@nestjs/common';
import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { EruptionsService } from 'src/Application/eruptions.service';
import { Eruption } from 'src/Domain/Model/eruption.entity';

@Resolver()
export class EruptionsResolver {
  constructor(private readonly eruptionService: EruptionsService) {}

  @Query(() => [Eruption], { name: 'eruptions' })
  async FindAll() {
    return this.eruptionService.findAll();
  }

  @Query(() => Eruption, { name: 'eruption' })
  async FindOne(@Args('id', { type: () => ID }, ParseIntPipe) id: number) {
    return this.eruptionService.findOne(id);
  }
}
