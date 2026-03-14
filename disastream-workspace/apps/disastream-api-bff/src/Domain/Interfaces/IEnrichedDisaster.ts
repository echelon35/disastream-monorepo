import { Geometry } from 'typeorm';

export interface IEnrichedDisaster {
  id: number;
  type: string;
  point: Geometry;
  sourceName: string;
  sourceAddress: string;
  city: string;
  country: string;
  iso: string;
  cityDistance: number;
  createdAt: Date;
  updatedAt: Date;
  premier_releve: Date;
  dernier_releve: Date;
}

export interface IEnrichedEarthquake extends IEnrichedDisaster {
  magnitude: number;
}

export interface IEnrichedFlood extends IEnrichedDisaster {
  surface: Geometry;
}
export interface IEnrichedEruption extends IEnrichedDisaster {
  surface: Geometry;
}

export interface IEnrichedHurricane extends IEnrichedDisaster {
  surface: Geometry;
  forecast: Geometry;
  path: Geometry;
}
