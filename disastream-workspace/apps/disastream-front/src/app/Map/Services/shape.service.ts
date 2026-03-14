import { Injectable } from "@angular/core";
import { Feature } from "geojson";
import L from "leaflet";
import { Country } from "src/app/Model/Country";

@Injectable({
    providedIn: 'root'
})
export class ShapeService {

    makeCountriesShape(map: L.Map, layer: L.LayerGroup, country: Country, callbackClick: (e) => void, context){
        if(country != undefined && map != undefined){
          const feature : GeoJSON.Feature = {
            "type": "Feature",
            "properties": country,
            "geometry": country.geom,
          };
            const currentLayer = new L.GeoJSON(feature,{
                style: {
                    fillColor:'#ffffff', color:'white',
                    weight: 1
                },
              });
              currentLayer.bindTooltip(country.namefr, {
                sticky: true
              });
              currentLayer.on('mouseover',() => {
                currentLayer.setStyle({
                    weight: 1,
                    color: '#666',
                    dashArray: '',
                    fillOpacity: 0.7
                });
              });
              currentLayer.on('mouseout',() => {
                currentLayer.resetStyle();
              })
              
              currentLayer.on('click',callbackClick,context)
              currentLayer!.addTo(layer);
              layer.addTo(map);
        }
    }

}