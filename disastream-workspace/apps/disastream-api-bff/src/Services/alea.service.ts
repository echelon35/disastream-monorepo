import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Alea } from '../Domain/alea.model';
import { Criterion } from '../Domain/criterion.model';
import { Repository } from 'typeorm';

@Injectable()
export class AleaService {
  constructor(
    @InjectRepository(Alea)
    private readonly aleaRepository: Repository<Alea>,
    @InjectRepository(Criterion)
    private readonly criterionRepository: Repository<Criterion>,
  ) { }

  async FindAllByCategories() {
    const aleas = await this.aleaRepository
      .createQueryBuilder('alea')
      .leftJoinAndSelect('alea.category', 'category')
      .select(['alea.name', 'alea.id', 'alea.label', 'category.name'])
      // .groupBy('category')
      .execute();

    return aleas;
  }

  async FindAllCriterias() {
    return await this.criterionRepository.find({ relations: ['alea'] });
  }
}
