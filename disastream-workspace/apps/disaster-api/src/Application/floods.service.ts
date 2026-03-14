import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserInputError } from 'apollo-server-express';
import { Flood } from 'src/Domain/Model/flood.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FloodsService {
  constructor(
    @InjectRepository(Flood)
    private readonly floodRepository: Repository<Flood>,
  ) {}

  async findAll() {
    return this.floodRepository.find();
  }

  async findOne(id: number) {
    const flood = this.floodRepository
      .createQueryBuilder('flood')
      .leftJoinAndSelect('flood.source', 'source')
      .where({ id: id })
      .getOne();
    if (!flood) {
      throw new UserInputError(`Flood ${id} does not exist`);
    }
    return flood;
  }
}
