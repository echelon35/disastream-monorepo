import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { City } from '@disastream/models';
import { GeoJsonObject } from 'geojson';
import { Repository } from 'typeorm';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  async findNearestTown(
    geometry: GeoJsonObject,
    distanceMin = 2688221,
  ): Promise<number> {
    const nearestCity = await this.cityRepository.query(`
SELECT c.id as id FROM cities c LEFT JOIN countries on countries.id = c."paysId" WHERE ST_DWithin(ST_GeomFromGeoJSON('${JSON.stringify(geometry)}')::geography, c.geom::geography, ${distanceMin}) ORDER BY ST_Distance(ST_GeomFromGeoJSON('${JSON.stringify(geometry)}')::geography, c.geom::geography) LIMIT 1;
`);

    const city = nearestCity != null ? nearestCity[0].id : null;

    return city;
  }
}
