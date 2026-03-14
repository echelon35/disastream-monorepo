
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, inject, Input, OnInit } from '@angular/core';
import { Place } from 'src/app/Model/Place';
import { environment } from 'src/environments/environment';
import * as L from "leaflet";
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { debounceTime, fromEvent, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/Shared/Shared.module';

@Component({
    selector: "app-search-place-modal",
    templateUrl: './SearchPlace.modal.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, SharedModule, FormsModule, ReactiveFormsModule]
})
export class SearchPlace implements OnInit {

    env = environment;
    appName: string = this.env.settings.appName;
    loading = false;

    private cd = inject(ChangeDetectorRef)

    isVisible = false;
    private wasInside = false;

    public selectedPlace = "";
    public selectedTown?: Place;
    public filterPlace = "";
    public townList: Place[] = [];
    @Input() areaMap?: L.Map;

    acceptedTypes: string[] = [
        "administrative",
        "volcano", //VOLCANS
        "river", //COURS D'EAU
        "peak", //MONTAGNE
        "mountain_range", //CHAINE DE MONTAGNES
        "ocean", //OCEAN
        "sea", //MER
        "desert", //DESERT
        "wood", //BOIS
        "attraction" //LIEUX TOURISTIQUES
    ]

    ngOnInit(){
      const searchBox = document.getElementById('search-country');
      if(searchBox != null){
        const keyup$ = fromEvent(searchBox, 'keyup');
        keyup$.pipe(
              map((i: any) => i.currentTarget.value),
              debounceTime(500)
            )
            .subscribe((val) => {
              console.log(val);
              this.filterPlace = val;
              this.searchPlace();
            });
      }
    }

    /**
     * Update component
     */
    updateComponent(){
      this.cd.markForCheck();
    }

    show() {
      this.isVisible = true;
    }
  
    close() {
      this.isVisible = false;
    }

    chooseTown(town: Place){
      this.selectedTown = town;
      this.locationZoom(town.boundingbox);
      if(town.name != null){
        this.filterPlace = town.name!;
      }
      this.close();
    }

    clear(){
      this.filterPlace = "";
      this.townList = [];
      this.updateComponent();
    }

    @HostListener('click')
    clickIn() {
      this.wasInside = true;
    }

    @HostListener('document:click')
    clickout() {
      if (!this.wasInside) {
        if(this.isVisible){
          this.close();
        }
      }
      this.wasInside = false;
    }
  
    searchPlace(){
      this.loading = true;
      this.townList = [];
      const provider = new OpenStreetMapProvider({ params: {
        'accept-language': 'fr',
        addressdetails: 1,
        format: "json",
        limit: 100,
        extratags: 1
      }});
      provider.search({ query: this.filterPlace }).then((res) => {
          this.townList = [];
          this.show();
          res.filter(item => item.raw.type != null && this.acceptedTypes.find(element => element == item.raw.type)).forEach(cursor => {
            const thisPlace = new Place();
            thisPlace.copyFromOpenStreetmapProvider(cursor);
            this.townList.push(thisPlace);
          })
          this.updateComponent();
          this.loading = false;
      });
  
    }

    locationZoom(boundingbox: L.LatLngBounds){
      if(this.areaMap !== undefined){
          this.areaMap.fitBounds(boundingbox);
      }
    }

}