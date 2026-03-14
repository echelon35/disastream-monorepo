import { Injectable } from '@nestjs/common';
import { Disaster } from '@disastream/models';
import { Geometry } from 'geojson';
import { Alert } from '../Domain/alert.model';
import {
  IEnrichedDisaster,
} from '../Domain/Interfaces/IEnrichedDisaster';
import { CriteriaMatcher } from '../Common/Utils/CriteriaMatcher';
import { DisasterStrategyRegistry } from '../Strategy/Aleas/disasterStrategy.registry';

export enum LogType {
  MAIL = 'Mail',
  SQS = 'SQS',
}

export interface IFilterDisaster {
  country: string;
  city: string;
  premier_releve: string;
  dernier_releve: string;
}

@Injectable()
export class DisasterService {
  constructor(
    private readonly strategyRegistry: DisasterStrategyRegistry,
  ) { }

  async findDisasterToSendInAlert(id: number, type: string): Promise<Disaster> {
    const strategy = this.strategyRegistry.getStrategy(type);

    const baseSelect: any = {
      id: true,
      premier_releve: true,
      dernier_releve: true,
      point: {
        type: true,
        coordinates: true,
      },
      idFromSource: true,
      lien_source: true,
      nb_ressenti: true,
      visible: true,
      nearestCityId: true,
      source: {
        id: true,
        name: true,
        adress: true,
      },
    };

    strategy.extraSelectFields.forEach((field) => {
      baseSelect[field] = true;
    });

    const disaster = await strategy.getRepository().findOne({
      select: baseSelect,
      where: { id: id },
      relations: ['source'],
    });

    return disaster;
  }

  async findDisasterToDisplay(id: number, type: string): Promise<Disaster> {
    const strategy = this.strategyRegistry.getStrategy(type);
    const tableName = strategy.tableName;

    let extraGeoJSON = '';
    strategy.extraGeoJSONFields.forEach((field) => {
      extraGeoJSON += `ST_AsGeoJSON(disaster.${field})::json as "${field}", `;
    });

    const disaster = await strategy.getRepository().query(`
      SELECT disaster.*,
      ST_AsGeoJSON(disaster.point)::json as "point", 
      ${extraGeoJSON}
      sources.name as "sourceName", 
      sources.adress as "sourceAdress", 
      cities.namefr as city,
      countries.namefr as country,
      countries.iso3166_2 as iso,
      ST_Distance(disaster.point::geography, cities.geom)/1000 as "cityDistance"
      FROM "${tableName}" disaster
      LEFT JOIN sources ON sources.id = disaster."source"
      LEFT JOIN cities ON cities.id = disaster."nearestCityId"
      LEFT JOIN countries ON countries.id = cities."paysId"
      WHERE disaster.id = ${id};
    `);

    return disaster ? disaster[0] : null;
  }

  async findDisastersInArea(
    area: Geometry,
    page: number,
    disasterType: string,
    filters: IFilterDisaster = {
      country: '',
      city: '',
      premier_releve: '',
      dernier_releve: '',
    },
  ): Promise<IEnrichedDisaster[]> {
    if (page == null) {
      throw new Error('page is null');
    }

    const strategy = this.strategyRegistry.getStrategy(disasterType);
    const tableName = strategy.tableName;

    let extraGeoJSON = '';
    strategy.extraGeoJSONFields.forEach((field) => {
      extraGeoJSON += `ST_AsGeoJSON(disaster.${field})::json as "${field}", `;
    });

    const queryArea =
      area == null
        ? ``
        : ` WHERE ST_Intersects(ST_GeomFromGeoJSON('${JSON.stringify(area)}'), "point")`;

    const country =
      filters != null && filters.country != null && filters.country != ''
        ? `countries.namefr ILIKE '%${filters.country}%'`
        : '';

    const queryCountry =
      country == ''
        ? ''
        : queryArea != ''
          ? ' AND ' + country
          : ' WHERE ' + country;

    const city =
      filters != null && filters.city != null && filters.city != ''
        ? `cities.namefr ILIKE '%${filters.city}%'`
        : '';

    const queryCities =
      city == ''
        ? ''
        : queryArea == '' && queryCountry == ''
          ? ' WHERE ' + city
          : ' AND ' + city;

    const premier_releve =
      filters.premier_releve != '' && filters.premier_releve != null
        ? `disaster."premier_releve" >= '${filters.premier_releve}'`
        : '';
    const query_premier_releve =
      premier_releve == ''
        ? ''
        : queryCountry != '' || queryArea != '' || queryCities != ''
          ? ' AND ' + premier_releve
          : ' WHERE ' + premier_releve;
    const dernier_releve =
      filters.dernier_releve != ''
        ? `disaster."dernier_releve" <= '${filters.dernier_releve}'`
        : '';
    const query_dernier_releve =
      dernier_releve == ''
        ? ''
        : queryCountry != '' ||
          queryArea != '' ||
          queryCities != '' ||
          query_premier_releve != ''
          ? ' AND ' + dernier_releve
          : ' WHERE ' + dernier_releve;

    const query = `
      SELECT disaster.*,
      '${disasterType}' as type,
      ${extraGeoJSON}
      ST_AsGeoJSON(disaster.point)::json as "point", 
      sources.name as "sourceName", 
      sources.adress as "sourceAdress", 
      cities.namefr as city,
      countries.namefr as country,
      countries.iso3166_2 as iso,
      ST_Distance(disaster.point::geography, cities.geom)/1000 as "cityDistance"
      FROM "${tableName}" disaster
      LEFT JOIN sources ON sources.id = disaster."source"
      LEFT JOIN cities ON cities.id = disaster."nearestCityId"
      LEFT JOIN countries ON countries.id = cities."paysId"
      ${queryArea}${queryCountry}${queryCities}${query_premier_releve}${query_dernier_releve};
    `;

    const results = await strategy.getRepository().query(query);

    return results;
  }

  async getDisastersFromArea(
    alert: Alert,
    page: number,
    limit: number = 20,
    filter: string = 'dernier_releve',
    order: string = 'desc',
    query: IFilterDisaster = {
      country: '',
      city: '',
      premier_releve: '',
      dernier_releve: '',
    },
    strictCriteria: boolean = false,
  ): Promise<{
    count: number;
    disasters: IEnrichedDisaster[];
  }> {
    if (alert == null) {
      throw new Error('alert is null');
    }
    if (page == null) {
      throw new Error('page is null');
    }
    let disasters: IEnrichedDisaster[] = [];
    let count = 0;

    for (const alea of alert.aleas) {
      try {
        const results = await this.findDisastersInArea(
          alert.areas,
          page,
          alea.name,
          query,
        );
        count += results.length;
        disasters.push(...results);
      } catch (e) {
        console.error(`Error fetching disasters for ${alea.name}: ${e.message}`);
      }
    }

    if (
      strictCriteria &&
      alert.criterias &&
      Array.isArray(alert.criterias) &&
      alert.criterias.length > 0
    ) {
      disasters = disasters.filter((d) =>
        CriteriaMatcher.match(
          alert.criterias as unknown as any[],
          d as any,
          d.type,
        ),
      );
      count = disasters.length;
    }

    if (filter != null && filter != '') {
      const sortOrder = order.toUpperCase() === 'ASC' ? 1 : -1;
      // Filter disasters by filter
      switch (filter) {
        case 'premier_releve':
          disasters = disasters.sort((a, b) => {
            return (
              (new Date(a.premier_releve).getTime() -
                new Date(b.premier_releve).getTime()) *
              sortOrder
            );
          });
          break;
        case 'dernier_releve':
          disasters = disasters.sort((a, b) => {
            return (
              (new Date(a.dernier_releve).getTime() -
                new Date(b.dernier_releve).getTime()) *
              sortOrder
            );
          });
          break;
        case 'country':
          disasters = disasters.sort((a, b) => {
            return (
              (a.country.toLowerCase() > b.country.toLowerCase() ? 1 : -1) *
              sortOrder
            );
          });
          break;
        case 'city':
          disasters = disasters.sort((a, b) => {
            return (
              (a.city.toLowerCase() > b.city.toLowerCase() ? 1 : -1) * sortOrder
            );
          });
          break;
        case 'type':
          disasters = disasters.sort((a, b) => {
            return (
              (a.type.toLowerCase() > b.type.toLowerCase() ? 1 : -1) * sortOrder
            );
          });
          disasters = disasters.sort((a, b) => {
            if (a.type === b.type) {
              try {
                const strategyA = this.strategyRegistry.getStrategy(a.type);
                const strategyB = this.strategyRegistry.getStrategy(b.type);
                const valA = strategyA.getSortValue(a);
                const valB = strategyB.getSortValue(b);
                return (valA > valB ? 1 : -1) * sortOrder;
              } catch (e) {
                return 0;
              }
            }
            return 0;
          });
          break;
      }
    }

    const maxPage = Math.ceil(disasters.length / limit);
    disasters =
      maxPage == 0
        ? disasters
        : page < maxPage
          ? disasters.slice((page - 1) * limit, page * limit)
          : disasters.slice((maxPage - 1) * limit, maxPage * limit);

    return {
      count: count,
      disasters: disasters,
    };
  }
}
