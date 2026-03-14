import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Alea } from '../Domain/Model/alea.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserInputError } from 'apollo-server-express';

@Injectable()
export class AleasService {
  constructor(
    @InjectRepository(Alea)
    private readonly aleaRepository: Repository<Alea>,
  ) {}

  async findAll() {
    return this.aleaRepository.find();
  }

  async findOne(id: number) {
    const alea = await this.aleaRepository.findOne({ where: { id } });
    if (!alea) {
      throw new UserInputError(`Alea ${id} does not exist`);
    }
    return alea;
  }
}
