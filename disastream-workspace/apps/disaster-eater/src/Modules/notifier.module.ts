import { Module } from '@nestjs/common';
import { NotifierService } from '../Application/notifier.service';
import { LoggerModule } from './logger.module';

@Module({
  imports: [LoggerModule],
  providers: [NotifierService],
  exports: [NotifierService],
})
export class NotifierModule { }
