import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './Common/Decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/health')
  @Public()
  getHealth(): boolean {
    return true;
  }
}
