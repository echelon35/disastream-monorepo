import { Module } from '@nestjs/common';
import { EmailerService } from '../Services/emailer.service';
import { LogModule } from './log.module';

@Module({
  providers: [EmailerService],
  imports: [LogModule],
  controllers: [],
  exports: [EmailerService],
})
export class EmailerModule { }
