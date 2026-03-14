import { Controller, Get } from '@nestjs/common';
import { Hurricane } from '@disastream/models';
import { HurricaneJob } from '../Cron/hurricane_job.service';

@Controller('hurricane')
export class HurricaneController {
  constructor(private readonly hurricaneJob: HurricaneJob) { }

  @Get('data')
  getAllHurricaneData(): Promise<Hurricane[]> {
    return this.hurricaneJob.getAllHurricaneData();
  }
}
