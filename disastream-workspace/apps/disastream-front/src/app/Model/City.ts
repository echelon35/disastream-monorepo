import { Geometry } from "geojson";

export interface ICity {
    cityId: number;
    namefr: string;
    paysId: number;
    iso3166_2: string;
    longitude?: number;
    latitude?: number;
    geom: string | Geometry;
}

export class City implements ICity {
    cityId: number;
    namefr: string;
    paysId: number;
    iso3166_2: string;
    longitude?: number;
    latitude?: number;
    geom: string | Geometry;

    constructor(obj?: Partial<ICity>) {
        if (obj) {
            Object.assign(this, obj);
        }
    }
}