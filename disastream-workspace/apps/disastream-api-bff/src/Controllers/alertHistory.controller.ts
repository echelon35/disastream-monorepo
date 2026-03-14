import { Controller, Get, Request } from '@nestjs/common';
import { AlertHistoryService } from '../Services/alertHistory.service';

export class CreateMailAlertDto {
  mail: string;
}

@Controller('history')
export class AlertHistoryController {
  constructor(private readonly alertHistoryService: AlertHistoryService) { }

  @Get('')
  async getUserAlerts(@Request() req) {
    const userId = req?.user?.user?.id;
    return await this.alertHistoryService.findAllByUserId(userId);
  }

  @Get('/last-week')
  async lastWeek(@Request() req) {
    const userId = req?.user?.user?.id;
    return await this.alertHistoryService.lastWeek(userId);
  }
}
