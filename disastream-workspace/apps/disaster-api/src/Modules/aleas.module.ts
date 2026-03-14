import { Module } from '@nestjs/common';
import { AleasResolver } from '../Resolvers/aleas.resolver';
import { AleasService } from '../Application/aleas.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alea } from '../Domain/Model/alea.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Alea])],
  providers: [AleasResolver, AleasService],
})
export class AleasModule {}
