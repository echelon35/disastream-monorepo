import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MapComponent } from 'src/app/Map/Components/map/map.component';
import { SharedModule } from 'src/app/Shared/Shared.module';
import { DisasterApiService } from 'src/app/Services/DisasterApiService';
import { MarkerService } from 'src/app/Map/Services/marker.service';
import L from 'leaflet';
import { Earthquake } from 'src/app/Model/Earthquake';
import { Flood } from 'src/app/Model/Flood';
import { Hurricane } from 'src/app/Model/Hurricane';
import { Eruption } from 'src/app/Model/Eruption';
import { Disaster } from 'src/app/Model/Disaster';

@Component({
    standalone: true,
    imports: [CommonModule, SharedModule, MapComponent],
    providers: [MarkerService],
    templateUrl: './DisasterDetail.view.html',
})
export class DisasterDetailView implements OnInit, OnDestroy {
    aleaType: string = '';
    aleaId: number = 0;
    disaster: any; // We'll hold the raw GraphQL response here
    disasterModel: Disaster | undefined;

    map: L.Map | undefined;
    disasterLayer: L.LayerGroup = new L.LayerGroup();

    canGoBack: boolean = false;

    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private location = inject(Location);
    private disasterApiService = inject(DisasterApiService);
    private markerService = inject(MarkerService);
    private resizeObserver: ResizeObserver | null = null;

    ngOnInit(): void {
        const state: any = this.location.getState();
        if (state && state.fromDisasterView) {
            this.canGoBack = true;
        }

        this.route.paramMap.subscribe(params => {
            this.aleaType = params.get('alea') || '';
            this.aleaId = Number(params.get('id'));
            if (this.aleaType && this.aleaId) {
                this.fetchDisaster();
            }
        });
    }

    ngOnDestroy(): void {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    goBack() {
        if (this.canGoBack) {
            this.router.navigate(['/dashboard/map'], { state: { restoreState: true } });
        } else {
            this.router.navigate(['/dashboard/map']);
        }
    }

    receiveMap(map: L.Map) {
        this.map = map;
        this.map.addLayer(this.disasterLayer);
        this.drawDisaster();
    }

    fetchDisaster() {
        switch (this.aleaType) {
            case 'earthquake':
                this.disasterApiService.searchEarthquakeById(this.aleaId).subscribe(res => {
                    if (res?.data?.earthquake) {
                        this.disaster = { ...res.data.earthquake };
                        this.disaster.type = 'earthquake';
                        this.disasterModel = new Earthquake(this.disaster);
                        if (this.map) {
                            this.drawDisaster();
                        }
                    }
                });
                break;
            case 'flood':
                this.disasterApiService.searchFloodById(this.aleaId).subscribe(res => {
                    if (res?.data?.flood) {
                        this.disaster = { ...res.data.flood };
                        this.disaster.type = 'flood';
                        this.disasterModel = new Flood(this.disaster);
                        this.drawDisaster();
                    }
                });
                break;
            case 'hurricane':
                this.disasterApiService.searchHurricaneById(this.aleaId).subscribe(res => {
                    if (res?.data?.hurricane) {
                        this.disaster = { ...res.data.hurricane };
                        this.disaster.type = 'hurricane';
                        this.disasterModel = new Hurricane(this.disaster);
                        this.drawDisaster();
                    }
                });
                break;
            case 'eruption':
                this.disasterApiService.searchEruptionById(this.aleaId).subscribe(res => {
                    if (res?.data?.eruption) {
                        this.disaster = { ...res.data.eruption };
                        this.disaster.type = 'eruption';
                        this.disasterModel = new Eruption(this.disaster);
                        this.drawDisaster();
                    }
                });
                break;
        }
    }

    drawDisaster() {
        if (!this.map || !this.disasterModel || !this.disasterModel.point) return;

        const container = this.map.getContainer();
        // Attendre que le conteneur Angular possède des dimensions (Display: block/flex terminé)
        if (container.clientWidth === 0 || container.clientHeight === 0) {
            if (!this.resizeObserver) {
                this.resizeObserver = new ResizeObserver(() => {
                    if (container.clientWidth > 0 && container.clientHeight > 0) {
                        this.resizeObserver?.disconnect();
                        this.resizeObserver = null;
                        this.map?.invalidateSize();
                        this.drawDisaster(); // Relancer maintenant que la taille est acquise
                    }
                });
                this.resizeObserver.observe(container);
            }
            return;
        }

        this.disasterLayer.clearLayers();

        // Center the map on the disaster
        if (this.disasterModel.point && this.disasterModel.point.coordinates) {
            this.map.setView(new L.LatLng(this.disasterModel.point.coordinates[1], this.disasterModel.point.coordinates[0]), 7);
        }

        switch (this.disasterModel.type) {
            case 'earthquake':
                this.markerService.makeEarthquakeMarkers(this.map, this.disasterLayer, this.disasterModel as Earthquake, null, true, false, true);
                break;
            case 'flood':
                this.markerService.makeFloodMarkers(this.map, this.disasterLayer, this.disasterModel as Flood, null, true, false, true);
                break;
            case 'hurricane':
                this.markerService.makeHurricaneMarkers(this.map, this.disasterLayer, this.disasterModel as Hurricane, null, true, false, true);
                break;
            // Depending on implementation, eruption markers might also exist, but MarkerService only has Earthquake/Flood/Hurricane/Eruption if implemented
        }
    }
}
