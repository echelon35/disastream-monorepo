import { Body, Controller, HttpStatus, Post, Response } from '@nestjs/common';
import { Public } from '../Common/Decorators/public.decorator';
import { CityService } from '../Services/city.service';

@Controller('city')
export class CityController {
  constructor(private readonly cityService: CityService) { }

  @Post('/near')
  @Public()
  async findNearest(@Body() body, @Response() res) {
    if (body.geojson != null) {
      const distanceMin = body.distanceMin || 10000;
      const city = await this.cityService.findNearestTown(
        body.geojson,
        distanceMin,
      );
      res.status(HttpStatus.OK).send(city);
    } else {
      res.status(HttpStatus.OK).json('Oups');
    }
  }
}
