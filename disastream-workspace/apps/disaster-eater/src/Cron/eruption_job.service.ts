import { Cron } from '@nestjs/schedule';
import { Injectable, Inject } from '@nestjs/common';
import { Eruption } from '@disastream/models';
import { GenericJob } from './generic_job.service';

@Injectable()
export class EruptionJob {
  constructor(
    @Inject('EruptionGenericJob') private genericJob: GenericJob<Eruption>,
  ) { }

  //All 15 minutes
  @Cron('0 */15 * * * *', {
    waitForCompletion: true,
  })
  async getAllEruptionData(): Promise<Eruption[]> {
    return this.genericJob.executeJob('eruption');
  }
}

