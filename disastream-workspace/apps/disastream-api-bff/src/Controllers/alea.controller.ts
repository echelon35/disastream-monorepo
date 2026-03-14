import { Controller, Get } from '@nestjs/common';
import { Public } from '../Common/Decorators/public.decorator';
import { Alea } from '../Domain/alea.model';
import { AleaService } from '../Services/alea.service';

@Controller('aleas')
export class AleaController {
  constructor(private readonly aleaService: AleaService) { }

  @Get('/')
  @Public()
  async findAll(): Promise<Alea[]> {
    return await this.aleaService.FindAllByCategories();
  }

  @Get('/criterias')
  @Public()
  async findAllCriterias() {
    return await this.aleaService.FindAllCriterias();
  }
}
