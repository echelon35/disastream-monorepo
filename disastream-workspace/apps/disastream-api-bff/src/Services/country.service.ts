import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Country } from '@disastream/models';
import { Repository } from 'typeorm';
import { UpdateCountryDto } from '../DTO/updateCountry.dto';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country, 'DisasterDb')
    private readonly countryRepository: Repository<Country>,
  ) { }

  async findAll() {
    return await this.countryRepository.find();
  }

  async findByPk(id: number) {
    return await this.countryRepository.findOneBy({
      id: id,
    });
  }

  async findCountryWithGeoJson(id: number) {
    const result = await this.countryRepository.query(
      `
      SELECT c.id, c.namefr, c.population, c.superficie, c.wikilink, c.trigramme, c.iso3166_2, ST_AsGeoJSON(c.geom) as geom 
      FROM countries c 
      WHERE c.id = $1`,
      [id],
    );

    return result && result.length > 0 ? result[0] : null;
  }

  async updateCountry(id: number, updateData: UpdateCountryDto) {
    const country = await this.countryRepository.findOneBy({ id });
    if (!country) return null;

    if (updateData.population !== undefined)
      country.population = updateData.population;
    if (updateData.superficie !== undefined)
      country.superficie = updateData.superficie;
    if (updateData.wikilink !== undefined)
      country.wikilink = updateData.wikilink;
    if (updateData.trigramme !== undefined)
      country.trigramme = updateData.trigramme;
    if (updateData.iso3166_2 !== undefined)
      country.iso3166_2 = updateData.iso3166_2;

    await this.countryRepository.save(country);

    // Si une nouvelle géométrie est fournie, on la met à jour séparément avec PostGIS
    if (updateData.geom) {
      const geomString =
        typeof updateData.geom === 'string'
          ? updateData.geom
          : JSON.stringify(updateData.geom);
      await this.countryRepository.query(
        `UPDATE countries SET geom = ST_SetSRID(ST_GeomFromGeoJSON($1), 4326) WHERE id = $2`,
        [geomString, id],
      );
    }

    return this.findCountryWithGeoJson(id);
  }
}
