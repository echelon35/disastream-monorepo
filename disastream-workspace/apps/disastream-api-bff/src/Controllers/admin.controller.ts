import {
  Controller,
  Get,
  UseGuards,
  Param,
  Query,
  Put,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { Roles } from '../Common/Decorators/role.decorator';
import { RolesGuard } from '../Guards/role.guard';
import { CityService } from '../Services/city.service';
import { CountryService } from '../Services/country.service';
import { UpdateCityDto } from '../DTO/updateCity.dto';
import { UpdateMultipleCitiesDto } from '../DTO/updateMultipleCities.dto';
import { UpdateCountryDto } from '../DTO/updateCountry.dto';
import { Patch } from '@nestjs/common';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly cityService: CityService,
    private readonly countryService: CountryService,
  ) { }

  @Get()
  @Roles('Admin')
  @UseGuards(RolesGuard)
  async isAdmin(): Promise<{ isAdmin: boolean }> {
    return { isAdmin: true };
  }

  @Get('cities/:countryId')
  @Roles('Admin')
  @UseGuards(RolesGuard)
  async getCitiesByCountry(
    @Param('countryId') countryId: string,
    @Query('outOfGeometry') outOfGeometry?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const isOutOfGeometry = outOfGeometry === 'true';
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;

    return this.cityService.findByCountry(
      +countryId,
      isOutOfGeometry,
      pageNum,
      limitNum,
    );
  }

  @Put('cities/:id')
  @Roles('Admin')
  @UseGuards(RolesGuard)
  async updateCity(
    @Param('id') id: string,
    @Body() updateCityDto: UpdateCityDto,
  ) {
    const updatedCity = await this.cityService.update(+id, updateCityDto);
    if (!updatedCity) {
      throw new NotFoundException(`Ville avec id ${id} introuvable`);
    }
    return updatedCity;
  }

  @Patch('cities')
  @Roles('Admin')
  @UseGuards(RolesGuard)
  async updateMultipleCities(
    @Body() updateMultipleCitiesDto: UpdateMultipleCitiesDto,
  ) {
    return this.cityService.updateMultiple(updateMultipleCitiesDto);
  }

  @Get('cities/:countryId/count')
  @Roles('Admin')
  @UseGuards(RolesGuard)
  async getCitiesCount(@Param('countryId') countryId: string) {
    return this.cityService.countByCountry(+countryId);
  }

  @Get('country/:id')
  @Roles('Admin')
  @UseGuards(RolesGuard)
  async getCountry(@Param('id') id: string) {
    const country = await this.countryService.findCountryWithGeoJson(+id);
    if (!country) {
      throw new NotFoundException(`Pays avec id ${id} introuvable`);
    }
    return country;
  }

  @Put('country/:id')
  @Roles('Admin')
  @UseGuards(RolesGuard)
  async updateCountry(
    @Param('id') id: string,
    @Body() updateCountryDto: UpdateCountryDto,
  ) {
    const updatedCountry = await this.countryService.updateCountry(
      +id,
      updateCountryDto,
    );
    if (!updatedCountry) {
      throw new NotFoundException(`Pays avec id ${id} introuvable`);
    }
    return updatedCountry;
  }
}
