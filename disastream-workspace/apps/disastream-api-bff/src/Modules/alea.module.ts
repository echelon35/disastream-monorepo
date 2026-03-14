import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AleaController } from '../Controllers/alea.controller';
import { Alea } from '../Domain/alea.model';
import { Category } from '../Domain/category.model';
import { Criterion } from '../Domain/criterion.model';
import { AleaService } from '../Services/alea.service';

@Module({
  providers: [AleaService],
  imports: [TypeOrmModule.forFeature([Alea, Category, Criterion])],
  controllers: [AleaController],
})
export class AleaModule { }
