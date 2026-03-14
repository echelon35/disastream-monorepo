import { Injectable, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Flood } from '@disastream/models';
import { GenericJob } from './generic_job.service';

@Injectable()
export class FloodJob {
  constructor(
    @Inject('FloodGenericJob') private genericJob: GenericJob<Flood>,
  ) { }

  //All 13 minutes
  @Cron('0 */13 * * * *', {
    waitForCompletion: true,
  })
  async getAllInondationData(): Promise<Flood[]> {
    return this.genericJob.executeJob('flood');
  }
}

