import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserInputError } from 'apollo-server-express';
import { Earthquake } from 'src/Domain/Model/earthquake.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EarthquakesService {
  constructor(
    @InjectRepository(Earthquake)
    private readonly earthquakeRepository: Repository<Earthquake>,
  ) {}

  async findAll() {
    return this.earthquakeRepository.find();
  }

  async findOne(id: number) {
    const earthquake = this.earthquakeRepository
      .createQueryBuilder('earthquake')
      .leftJoinAndSelect('earthquake.source', 'source')
      .where({ id: id })
      .getOne();
    if (!earthquake) {
      throw new UserInputError(`Earthquake ${id} does not exist`);
    }
    return earthquake;
  }
}
