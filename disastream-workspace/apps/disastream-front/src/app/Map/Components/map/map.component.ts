import { EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { SimpleChanges } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
// import "leaflet.fullscreen/Control.Fullscreen";
// import * as screenfull from 'screenfull';
// window.screenfull = screenfull;
import 'leaflet-draw';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { Observable, Subscription } from 'rxjs';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    standalone: true
})
export class MapComponent implements OnInit,OnDestroy {

  @Input() mapId = 'map';
  @Input() displayFullscreen = true;
  @Input() allowSearch = false;
  @Input() displayLayers = true;
  @Input() displayScale = true;
  @Input() displayZoom = true;
  @Input() layerPrincipal = "";
  @Input() scrollZoom = true;
  @Input() dragMarker = false;
  @Input() zoomDelta = 1;

  @Input() locationBox?: L.LatLngBounds;

  // @Output() finishedLoading: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() map$ = new EventEmitter<L.Map>();
  @Output() layer$ = new EventEmitter<L.LayerGroup>();

  public isLoading = false;
  
  @Output() markerEvent = new EventEmitter<L.Marker>();
  @Output() movedMap = new EventEmitter<L.Map>();

  //Marker move from outside
  private markerSubscription!: Subscription;
  @Input() cursorEvent!: Observable<GeoJSON.Point>;

  private fullscreenSubscription!: Subscription;
  @Input() fullscreenMe!: Observable<void>;

  markerPost!: L.Marker;

  public mapDetail!: L.Map;
  public mapLayer!: L.LayerGroup;
  //Prepare the layer group that contains the layer we want to display

  ngOnInit():void{
    this.initMap();
    this.updateMap();
    if(this.cursorEvent != null){
      this.markerSubscription = this.cursorEvent.subscribe(point => {
        ////console.log("le curseur de la map se déplace : " + JSON.stringify(point));
        this.mapDetail.setView(L.latLng(point.coordinates[1],point.coordinates[0]),10)
        this.markerPost.setLatLng(L.latLng(point.coordinates[1],point.coordinates[0]))
        this.markerEvent.emit(this.markerPost);
      })
    }
    if(this.fullscreenMe != null){
      this.fullscreenSubscription = this.fullscreenMe.subscribe(() => $(".leaflet-control-zoom-fullscreen")[0].click())
    }
  }

  ngOnChanges(changes: SimpleChanges){
    if(this.mapDetail != undefined){
      this.updateMap();
    }
  }

  ngOnDestroy(){
    if(this.mapDetail != undefined){
      this.mapDetail.remove();
    }

    if(this.markerSubscription != undefined){
      this.markerSubscription.unsubscribe();
    }

    if(this.fullscreenSubscription != undefined){
      this.fullscreenSubscription.unsubscribe();
    }
  }

  initMap(){
      // Déclaration de la carte avec les coordonnées du centre et le niveau de zoom.
      this.mapDetail = L.map(this.mapId,{
        center: [0, 0],
        boxZoom: true,
        zoom: 3,
        zoomControl: false,
        maxBoundsViscosity: 1.0,
        worldCopyJump: false,
        zoomDelta: this.zoomDelta,
        zoomSnap: 0
      });

      this.limitMap(-90,-360,90,360);
      this.setZoom(3,2,15);

      if(this.dragMarker){
        this.draggableMarker();
      }
      else if(this.allowSearch){
        this.addSearchProvider();
      }

      if(this.displayScale){
        L.control.scale({
          position: 'bottomright',
          imperial: false
        }).addTo(this.mapDetail);
      }

      this.layers();

      if(this.displayZoom){
        L.control.zoom({
          position:'topleft',
          zoomInTitle:'Zoomer',
          zoomOutTitle: 'Dézoomer'
        }).addTo(this.mapDetail);
      }

      this.mapDetail.addEventListener("dragend",() =>{
        this.movedMap.emit(this.mapDetail);
      },this)

  }

  layers(){
    // let huerotate;

    const GoogleEarthTileLayer = (L.tileLayer as any)('http://mt0.google.com/vt/lyrs=y&hl=fr&x={x}&y={y}&z={z}',{
    })

    const GoogleMapTileLayer = (L.tileLayer as any)('http://mt0.google.com/vt/lyrs=m&hl=fr&x={x}&y={y}&z={z}',{
    })

    const TopographieTileLayer = (L.tileLayer as any)('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}',{
      attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
    })
   
    const DisasterJawgTileLayer = (L.tileLayer as any)('https://tile.jawg.io/ac7e4ceb-cd7d-4ec0-a080-b98d9ea0eb07/{z}/{x}/{y}{r}.png?access-token={accessToken}',{
      attribution: '<a href="https://satellearth" title="Made by satellearth" target="_blank">&copy; <b>satellearth</b></a> with <a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      accessToken: '9DzG45EZHJkwSzBFKZSTA8IGmGruF13fwwiMUEQRlx7Hc6ZsS8j4kIi1PCBFCvab',
    })

    const DisasterJawgHdTileLayer = (L.tileLayer as any)('https://tile.jawg.io/fff1b98e-40c8-4bfc-bd27-8ca9781fbb15/{z}/{x}/{y}{r}.png?access-token={accessToken}',{
      attribution: '<a href="https://satellearth" title="Made by satellearth" target="_blank">&copy; <b>SatellEarth</b></a> with <a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      accessToken: '9DzG45EZHJkwSzBFKZSTA8IGmGruF13fwwiMUEQRlx7Hc6ZsS8j4kIi1PCBFCvab',
    })
   
    switch(this.layerPrincipal){
      case 'GoogleEarth':
        GoogleEarthTileLayer.addTo(this.mapDetail);
        break;
      case 'GoogleMap':
        GoogleMapTileLayer.addTo(this.mapDetail);
        break;
      // case 'Imagerie':
      //   ImagerieTileLayer.addTo(this.map);
      //   break;
      case 'Topographie':
        TopographieTileLayer.addTo(this.mapDetail);
        break;
      case 'Disaster':
        DisasterJawgTileLayer.addTo(this.mapDetail);
        break;
      case 'Disaster (HD)':
        DisasterJawgHdTileLayer.addTo(this.mapDetail);
        break;
      default:
        DisasterJawgTileLayer.addTo(this.mapDetail);
    }

    //Ajout des différents layers
    if(this.displayLayers){
      L.control.layers({
        "Disaster": DisasterJawgTileLayer,
        "Disaster (HD)": DisasterJawgHdTileLayer,
        "GoogleEarth": GoogleEarthTileLayer,
        "GoogleMap": GoogleMapTileLayer,
        // "Imagerie mondiale": ImagerieTileLayer,
        "Topographie": TopographieTileLayer
      }).addTo(this.mapDetail);
    }
  }

  limitMap(xMin: number,yMin: number,xMax: number,yMax: number){
		//South-West
		const southWest = L.latLng(xMin,yMin);
		//North-East
		const northEast = L.latLng(xMax,yMax);
		//All map size
		const bounds = L.latLngBounds(southWest, northEast);
		this.mapDetail.setMaxBounds(bounds);
		return this.mapDetail;
  }

	setZoom(zoom: number,minZoom: number,maxZoom: number){
		//Set the zoom of map
		this.mapDetail.setZoom(zoom);
		if(typeof(minZoom) != 'undefined'){
			this.mapDetail.options.minZoom = minZoom;
		}
		if(typeof(maxZoom) != 'undefined'){
			this.mapDetail.options.maxZoom = maxZoom;
		}
		return this.mapDetail;
  }

  draggableMarker(){
    this.markerPost = new L.Marker([0,0],{
      icon: new L.Icon({
        iconUrl: "assets/svg/marker.svg",	
        iconSize:     [60, 60], // size of icon
        iconAnchor:   [30, 60], // marker position on icon
        popupAnchor:  [0, -20] // point depuis lequel la popup doit s'ouvrir relativement à l'iconAnchor
      }),
      draggable: true,
      attribution: "post"
    });

    //Tooltip indiquant au user de déplacer le curseur
    this.markerPost.bindTooltip("Déplacez-moi ou aidez-vous de la barre de recherche",{
      permanent: true,
      className: 'bg-dark text-light',
      direction: "top",
      offset: [0, -60]
    })

    //Sur le déplacement du curseur, mise à jour de la déclaration
    this.markerPost.addEventListener("moveend",(e) =>{
      this.markerEvent.emit(e.target);
    },this);

    this.markerPost.addTo(this.mapDetail);
  }

  addSearchProvider(){
    const provider = new OpenStreetMapProvider({  params: {
      email: 'a.world.of.disasters@gmail.com', // auth for large number of requests
      'accept-language': 'fr',
      addressdetails: 1
    }});

    this.draggableMarker();

    const searchControl = GeoSearchControl({
      provider: provider,
      style: 'button',
      showPopup: false,
      autoCompleteDelay: 250,
      showMarker: true,
      marker: {
        icon: new L.Icon({
          iconUrl: "assets/icones/markers/epingle.png",	
          iconSize:     [30, 35], // size of icon
          iconAnchor:   [15, 35], // marker position on icon
          popupAnchor:  [0, -20] // point depuis lequel la popup doit s'ouvrir relativement à l'iconAnchor
        }),
        attribution: "searchControl"
      },
      position: 'topleft',
      keepResult: 'false',
      autoClose: true,
      searchLabel: 'Rechercher un lieu',
      classNames: { container:'form-inline form-group input-group text-light', button: '', resetButton: 'd-none', msgbox: 'bg-dark', form: 'col-10', input: 'search-disaster form-control' }
    });

    this.mapDetail.addControl(searchControl);

    this.mapDetail.on('geosearch/showlocation',(e)=>{
      this.mapDetail.eachLayer((item: any) => {

        //Don des coordonnées du marqueur du geosearch au marqueur du témoignage
        if (item instanceof L.Marker && item != undefined) {
          if(item.getAttribution !== undefined){
            const attribution = item.getAttribution();
            if(attribution == "searchControl"){
              this.markerPost.setLatLng(item.getLatLng());
              this.markerEvent.emit(this.markerPost);
              //Suppression du marqueur du geosearch
              this.mapDetail.removeLayer(item);
            }
          }
        }
      });
    },this);

  }

  updateMap(){
    this.map$.emit(this.mapDetail);
    this.layer$.emit(this.mapLayer);
  }

  selectMapZone(zone: string){

    let bound;
    let box;

    switch(zone){
      case "METROPOLE":
        //FRANCE METROPOLITAINE
        box = [-6.113481,41.934978,10.307773,51.727030];
        bound = L.latLngBounds(L.latLng(box[3], box[2]),L.latLng(box[1], box[0]))
        this.mapDetail.fitBounds(bound);
        break;
      default:
        box = [-90,41.934978,10.307773,51.727030];
        bound = L.latLngBounds(L.latLng(box[3], box[2]),L.latLng(box[1], box[0]))
        this.mapDetail.fitBounds(bound);
    }
  }

}
