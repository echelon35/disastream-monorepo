import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserInputError } from 'apollo-server-express';
import { Hurricane } from 'src/Domain/Model/hurricane.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HurricanesService {
  constructor(
    @InjectRepository(Hurricane)
    private readonly hurricaneRepository: Repository<Hurricane>,
  ) {}

  async findAll() {
    return this.hurricaneRepository.find();
  }

  async findOne(id: number) {
    const hurricane = this.hurricaneRepository
      .createQueryBuilder('hurricane')
      .leftJoinAndSelect('hurricane.source', 'source')
      .where({ id: id })
      .getOne();
    if (!hurricane) {
      throw new UserInputError(`Hurricane ${id} does not exist`);
    }
    return hurricane;
  }
}
