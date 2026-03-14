import * as L from 'leaflet';
import { PlaceType } from './PlaceType';
const dec = new TextDecoder("utf-8");

export class Place {
    name?: string;
    label!: string;
    //Id identifying the place in provider
    id!: string;
    providerId?: string;
    type: PlaceType = new PlaceType();
    providerTypeId?: string;
    state?: string;
    country?: string;
    //Country code is two letters used for picture
    countryCode?: string;
    longitude!: number;
    latitude!: number;
    wikilink?: string;
    cover?: string;

    boundingbox!: L.LatLngBounds;

    constructor(){}

    /**
     * Make a place object from openstreetmap
     * @param obj 
     */
    copyFromOpenStreetmapProvider(obj:any){
        //La recherche doit contenir au minimum lat et lon, et un label
        if(obj && obj.x && obj.y && obj.label){
            this.label = (obj.label) || null;
            this.name = this.label?.split(',')[0];
            this.longitude = (obj.x) || null;
            this.latitude = (obj.y) || null;

            if(obj.raw){
                this.providerId = (obj.raw.place_id) || null;
                this.providerTypeId = (obj.raw.type) || null;
                if(obj.raw.address){
                    this.state = (obj.raw.address.state) || null;
                    this.country = (obj.raw.address.country) || null;
                    this.countryCode = (obj.raw.address.country_code) || null;
                }

                if(obj.raw.extratags){
                    this.wikilink = (obj.raw.extratags.wikipedia);
                }

                if(obj.raw.boundingbox){
                    var boundingbox = obj.raw.boundingbox;
                    this.boundingbox = L.latLngBounds(L.latLng(boundingbox[0],boundingbox[2]),L.latLng(boundingbox[1],boundingbox[3]));
                }
            }

            
        }
    }

    copyInto(obj:any){
        if(obj){
            this.id = obj.id || null;
            this.label = obj.label || null;
            this.name = obj.name || null;
            try{
                if(obj.zone){
                    this.boundingbox = L.geoJSON(obj.zone).getBounds();
                }
            }
            catch{

            }
            this.country = obj.country || null;
            this.countryCode = obj.countryCode || null;
            if(obj.place_type){
                this.type.copyInto(obj.place_type);
            }
            // this.type.id = obj.placeTypeId || null;
            this.providerId = obj.providerId || null;
            this.providerTypeId = obj.providerPlaceType || null;
            if(obj.cover){
                this.cover = dec.decode(new Uint8Array(obj.cover.data));
            }
        }
    }

    coverPicturePath(){
        return `data:image/png;base64,${this.cover}`;
    }
}