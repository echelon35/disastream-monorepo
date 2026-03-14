import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReportType } from '../Domain/reportType.model';
import { Repository } from 'typeorm';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(ReportType)
    private readonly reportTypeRepository: Repository<ReportType>,
  ) { }

  async FindTypes() {
    const types = await this.reportTypeRepository.find();

    return types;
  }
}
