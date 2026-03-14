import { Disaster } from "../Model/Disaster";
import { Earthquake } from "../Model/Earthquake";
import { Flood } from "../Model/Flood";
import { Hurricane } from "../Model/Hurricane";

export class HistoryDisaster {
    disasterId: number;
    location: string;
    type: string;
    disaster: Disaster;

    constructor(obj) {
        Object.assign(this, obj);
        console.log(obj);
        if(obj.disaster){
            switch(obj.type){
                case 'flood':
                    this.disaster = new Flood(obj.disaster);
                    break;
                case 'earthquake':
                    this.disaster = new Earthquake(obj.disaster);
                    break;
                case 'hurricane':
                    this.disaster = new Hurricane(obj.disaster);
                    break;
            }
        }
    }

}