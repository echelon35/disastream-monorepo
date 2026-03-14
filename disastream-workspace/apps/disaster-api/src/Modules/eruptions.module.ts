import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Source } from 'src/Domain/Model/source.entity';
import { Eruption } from 'src/Domain/Model/eruption.entity';
import { EruptionsResolver } from 'src/Resolvers/eruptions.resolver';
import { EruptionsService } from 'src/Application/eruptions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Eruption, Source])],
  providers: [EruptionsResolver, EruptionsService],
})
export class EruptionsModule {}
