import { Controller, Get } from '@nestjs/common';
import { Eruption } from '@disastream/models';
import { EruptionJob } from '../Cron/eruption_job.service';

@Controller('eruption')
export class EruptionController {
  constructor(private readonly eruptionJob: EruptionJob) { }

  @Get('data')
  getAllEruptionData(): Promise<Eruption[]> {
    return this.eruptionJob.getAllEruptionData();
  }
}
