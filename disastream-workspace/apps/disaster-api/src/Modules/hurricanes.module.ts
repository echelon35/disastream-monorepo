import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Source } from 'src/Domain/Model/source.entity';
import { Hurricane } from 'src/Domain/Model/hurricane.entity';
import { HurricanesResolver } from 'src/Resolvers/hurricanes.resolver';
import { HurricanesService } from 'src/Application/hurricanes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Hurricane, Source])],
  providers: [HurricanesResolver, HurricanesService],
})
export class HurricanesModule {}
