import { Module } from '@nestjs/common';
import { CustomLogger } from '../Services/logger.service';

@Module({
  providers: [CustomLogger],
  controllers: [],
  exports: [CustomLogger],
})
export class LogModule { }
