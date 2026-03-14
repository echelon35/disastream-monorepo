import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Source } from 'src/Domain/Model/source.entity';
import { Flood } from 'src/Domain/Model/flood.entity';
import { FloodsService } from 'src/Application/floods.service';
import { FloodsResolver } from 'src/Resolvers/floods.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Flood, Source])],
  providers: [FloodsResolver, FloodsService],
})
export class FloodsModule {}
