import { Geometry } from "geojson";
import { Disaster, IDisaster } from "./Disaster";
import { DisasterFromAlertDto, DisasterFromAlertDtoHurricane } from "../DTO/DisasterFromAlertDto";

export interface IHurricane extends IDisaster {
    surface: Geometry;
    name: string;
    forecast: Geometry;
    path: Geometry;
}

export class Hurricane extends Disaster {
    surface: Geometry;
    forecast: Geometry;
    path: Geometry;
    name: string;
    override frenchType = 'Cyclone';
    override pictureType = '/assets/images/markers/hurricane.svg';
    override type = 'hurricane';

    constructor(obj: DisasterFromAlertDtoHurricane) {
        super(obj);
        if(obj) {
            this.surface = obj.surface;
            this.forecast = obj.forecast;
            this.name = obj.name;
            this.path = obj.path;
            this.title = 'Cyclone ' + this.name;
            this.power = this.name;
        }
    }
}
