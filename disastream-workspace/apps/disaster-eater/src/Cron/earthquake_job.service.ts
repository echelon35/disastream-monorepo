import { Injectable, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Earthquake } from '@disastream/models';
import { GenericJob } from './generic_job.service';

@Injectable()
export class EarthquakeJob {
  constructor(
    @Inject('EarthquakeGenericJob') private genericJob: GenericJob<Earthquake>,
  ) { }

  //All 3 minutes
  @Cron('0 */3 * * * *', {
    waitForCompletion: true,
  })
  async getAllEarthquakeData(): Promise<Earthquake[]> {
    return this.genericJob.executeJob('earthquake');
  }
}
