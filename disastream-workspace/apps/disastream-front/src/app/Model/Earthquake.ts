import { DisasterFromAlertDtoEarthquake } from "../DTO/DisasterFromAlertDto";
import { Disaster, IDisaster } from "./Disaster";

export interface IEarthquake extends IDisaster {
    magnitude: number;
}

export class Earthquake extends Disaster implements IEarthquake {
    magnitude: number;
    override frenchType = 'Séisme';
    override pictureType = '/assets/images/markers/min-earthquake.svg';
    override type = 'earthquake';

    constructor(obj: DisasterFromAlertDtoEarthquake){
        super(obj);
        if(obj){
            this.magnitude = obj.magnitude;
            this.power = 'M' + this.magnitude.toString();
            this.title = 'Séisme ' + this.power + ' à ' + this.city + ' (' + this.country + ')';
            this.pictureType = (obj.magnitude > 5.5) ? '/assets/images/markers/med-earthquake.svg' : '/assets/images/markers/min-earthquake.svg';
            this.pictureType = (obj.magnitude > 6.5) ? '/assets/images/markers/max-earthquake.svg' : this.pictureType;
        }
    }

}
