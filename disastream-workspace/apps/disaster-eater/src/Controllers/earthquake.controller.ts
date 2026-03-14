import { Controller, Get } from '@nestjs/common';
import { Earthquake } from '@disastream/models';
import { EarthquakeJob } from '../Cron/earthquake_job.service';

@Controller('earthquake')
export class EarthquakeController {
  constructor(private readonly earthquakeJob: EarthquakeJob) { }

  @Get('data')
  getAllEarthquakeData(): Promise<Earthquake[]> {
    return this.earthquakeJob.getAllEarthquakeData();
  }
}
