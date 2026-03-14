import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertController } from '../Controllers/alert.controller';
import { AlertHistoryController } from '../Controllers/alertHistory.controller';
import { ReportsController } from '../Controllers/reports.controller';
import { Alea } from '../Domain/alea.model';
import { Alert } from '../Domain/alert.model';
import { AlertHistory } from '../Domain/alertHistory.model';
import { Category } from '../Domain/category.model';
import { MailAlert } from '../Domain/mailAlert.model';
import { ReportType } from '../Domain/reportType.model';
import { User } from '../Domain/user.model';
import { AlertService } from '../Services/alert.service';
import { AlertHistoryService } from '../Services/alertHistory.service';
import { AlerterService } from '../Services/alerter.service';
import { QueueListenerService } from '../Services/queue_listener.service';
import { ReportService } from '../Services/report.service';
import { Repository } from 'typeorm';
import { DisasterModule } from './disaster.module';
import { EmailerModule } from './emailer.module';
import { LogModule } from './log.module';
import { StrategyModule } from './strategy.module';
import { City } from '@disastream/models';

@Module({
  providers: [
    Repository<Alert>,
    AlertService,
    AlertHistoryService,
    AlerterService,
    QueueListenerService,
    Repository<ReportType>,
    ReportService,
  ],
  imports: [
    StrategyModule,
    DisasterModule,
    LogModule,
    EmailerModule,
    TypeOrmModule.forFeature([
      Alert,
      ReportType,
      Alea,
      User,
      Category,
      MailAlert,
      AlertHistory,
    ]),
    TypeOrmModule.forFeature([City], 'DisasterDb'),
  ],
  controllers: [AlertController, ReportsController, AlertHistoryController],
  exports: [],
})
export class AlertModule {
  constructor(private readonly sqsListenerService: QueueListenerService) { }
}
