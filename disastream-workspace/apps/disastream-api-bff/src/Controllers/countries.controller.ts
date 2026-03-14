import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../Common/Decorators/public.decorator';
import { CountryService } from '../Services/country.service';

@Controller('country')
export class CountryController {
  constructor(private readonly countryService: CountryService) { }

  @Get('/')
  @Public()
  async findAll() {
    const countries = await this.countryService.findAll();
    return countries;
  }

  @Get('/:id')
  @Public()
  async find(@Param('id') id: number) {
    const country = await this.countryService.findByPk(id);
    return country;
  }
}
