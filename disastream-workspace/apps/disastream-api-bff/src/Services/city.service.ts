import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { City } from '@disastream/models';
import { GeoJsonObject } from 'geojson';
import { CityDistanceDto } from '../DTO/cityDistance.dto';
import { UpdateCityDto } from '../DTO/updateCity.dto';
import { UpdateMultipleCitiesDto } from '../DTO/updateMultipleCities.dto';
import { Repository } from 'typeorm';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City, 'DisasterDb')
    private readonly cityRepository: Repository<City>,
  ) { }

  async findNearestTown(
    geometry: GeoJsonObject,
    distanceMin: number = 2688221,
  ): Promise<CityDistanceDto> {
    const nearestCity = await this.cityRepository.query(`
SELECT c.id as cityId, c.namefr as city, countries.namefr as country, countries.iso3166_2 as iso, ST_Distance(ST_GeomFromGeoJSON('${JSON.stringify(geometry)}')::geography, c.geom)/1000 as distance
    FROM cities c LEFT JOIN countries on countries.id = c."paysId" WHERE ST_DWithin(ST_GeomFromGeoJSON('${JSON.stringify(geometry)}')::geography, c.geom::geography, ${distanceMin}) ORDER BY ST_Distance(ST_GeomFromGeoJSON('${JSON.stringify(geometry)}')::geography, c.geom::geography) LIMIT 1;
`);

    const city =
      nearestCity != null
        ? {
          city: nearestCity[0].city,
          distance: nearestCity[0].distance,
          country: nearestCity[0].country,
          cityId: nearestCity[0].cityId,
          iso: nearestCity[0].iso,
        }
        : null;

    return city;
  }

  async findById(id: number, geometry: GeoJsonObject) {
    const nearestCity = await this.cityRepository.query(`
      SELECT c.id as cityId, c.namefr as city, countries.namefr as country, countries.iso3166_2 as iso, ST_Distance(ST_GeomFromGeoJSON('${JSON.stringify(geometry)}')::geography, c.geom)/1000 as distance
          FROM cities c LEFT JOIN countries on countries.id = c."paysId" WHERE c.id = ${id};
      `);

    const city =
      nearestCity != null
        ? {
          city: nearestCity[0].city,
          distance: nearestCity[0].distance,
          country: nearestCity[0].country,
          cityId: nearestCity[0].cityId,
          iso: nearestCity[0].iso,
        }
        : null;

    return city;
  }

  async countByCountry(countryId: number) {
    const countResult = await this.cityRepository.query(`
      SELECT COUNT(c.id) as total 
      FROM cities c 
      WHERE c."paysId" = ${countryId}`);
    const total = parseInt(countResult[0].total, 10);
    return { total };
  }

  async findByCountry(
    countryId: number,
    outOfGeometry: boolean,
    page: number = 1,
    limit: number = 50,
  ) {
    const offset = (page - 1) * limit;

    let dataQuery = '';
    let countQuery = '';
    const queryArgs = [countryId, limit, offset];

    if (outOfGeometry) {
      dataQuery = `
        SELECT c.id, c.namefr, c.population, c.altitude, c.timezone, c."paysId", ST_AsGeoJSON(c.geom) as geom 
        FROM cities c 
        JOIN countries co ON co.id = c."paysId" 
        WHERE c."paysId" = $1 AND ST_Intersects(c.geom, co.geom) = false
        LIMIT $2 OFFSET $3`;

      countQuery = `
        SELECT COUNT(c.id) as total 
        FROM cities c 
        JOIN countries co ON co.id = c."paysId" 
        WHERE c."paysId" = $1 AND ST_Intersects(c.geom, co.geom) = false`;
    } else {
      dataQuery = `
        SELECT c.id, c.namefr, c.population, c.altitude, c.timezone, c."paysId", ST_AsGeoJSON(c.geom) as geom 
        FROM cities c 
        WHERE c."paysId" = $1
        LIMIT $2 OFFSET $3`;

      countQuery = `
        SELECT COUNT(c.id) as total 
        FROM cities c 
        WHERE c."paysId" = $1`;
    }

    const data = await this.cityRepository.query(dataQuery, queryArgs);
    const countResult = await this.cityRepository.query(countQuery, [
      countryId,
    ]);
    const total = parseInt(countResult[0].total, 10);

    return { data, total };
  }

  async update(id: number, updateData: UpdateCityDto) {
    const city = await this.cityRepository.findOne({ where: { id } });
    if (!city) {
      return null;
    }

    city.paysId = updateData.paysId;
    city.population = updateData.population;
    city.altitude = updateData.altitude;
    city.timezone = updateData.timezone;

    return this.cityRepository.save(city);
  }

  async updateMultiple(updateData: UpdateMultipleCitiesDto) {
    if (!updateData.cityIds || updateData.cityIds.length === 0) {
      return { affected: 0 };
    }

    const updateFields: any = {};
    if (updateData.paysId !== undefined)
      updateFields.paysId = updateData.paysId;
    if (updateData.timezone !== undefined)
      updateFields.timezone = updateData.timezone;

    if (Object.keys(updateFields).length === 0) {
      return { affected: 0 };
    }

    const result = await this.cityRepository
      .createQueryBuilder()
      .update(City)
      .set(updateFields)
      .whereInIds(updateData.cityIds)
      .execute();

    return { affected: result.affected };
  }
}
