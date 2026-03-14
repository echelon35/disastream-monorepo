import { Controller, Get } from '@nestjs/common';
import { Flood } from '@disastream/models';
import { FloodJob } from '../Cron/flood_job.service';

@Controller('flood')
export class FloodController {
  constructor(private readonly floodJob: FloodJob) { }

  @Get('data')
  getAllInondationData(): Promise<Flood[]> {
    return this.floodJob.getAllInondationData();
  }
}
