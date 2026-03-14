import { Geometry } from "geojson";

export class DisasterFromAlertDto {
    id: number;
    premier_releve: Date;
    dernier_releve: Date;
    point: { type: string; coordinates: number[] };
    createdAt: Date;
    updatedAt: Date;
    type: string;
    iso: string;
    country: string;
    city: string;
    cityDistance: number;
    sourceName: string;
    sourceAddress: string;

    constructor(obj?: Partial<DisasterFromAlertDto>) {
        if (obj) {
            Object.assign(this, obj);
        }
    }
}

export class DisasterFromAlertDtoHurricane extends DisasterFromAlertDto {
    surface: Geometry;
    name: string;
    forecast: Geometry;
    path: Geometry;
}

export class DisasterFromAlertDtoEarthquake extends DisasterFromAlertDto {
    magnitude: number;
}

export class DisasterFromAlertDtoFlood extends DisasterFromAlertDto {
    surface: Geometry;
}

export class DisasterFromAlertDtoEruption extends DisasterFromAlertDto {
    surface: Geometry;
}