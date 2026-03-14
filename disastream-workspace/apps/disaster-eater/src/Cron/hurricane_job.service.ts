import { Injectable, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Hurricane } from '@disastream/models';
import { GenericJob } from './generic_job.service';

@Injectable()
export class HurricaneJob {
  constructor(
    @Inject('HurricaneGenericJob') private genericJob: GenericJob<Hurricane>,
  ) { }

  //All 18 minutes
  @Cron('0 */18 * * * *', {
    waitForCompletion: true,
  })
  async getAllHurricaneData(): Promise<Hurricane[]> {
    return this.genericJob.executeJob('hurricane');
  }
}

