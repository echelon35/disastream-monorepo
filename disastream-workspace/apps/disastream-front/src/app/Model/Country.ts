import { Geometry } from "geojson";

export class Country {
    id: number;
    namefr: string;
    trigramme: string;
    iso3166_2: string;
    continent: string;
    population: number;
    superficie: number;
    geom: Geometry;
    createdAt: Date;
    updatedAt: Date;
    wikilink: string;
    placeId: string;
  }