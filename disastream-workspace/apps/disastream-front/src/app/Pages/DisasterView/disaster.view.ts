import { Component, effect, inject, OnInit, ViewChild } from "@angular/core";
import L, { FeatureGroup } from "leaflet";
import 'leaflet.markercluster';
import { MarkerService } from "src/app/Map/Services/marker.service";
import { DisasterDetailComponent } from "src/app/Modals/DisasterDetail/disaster-detail.component";
import { Alert } from "src/app/Model/Alert";
import { Country } from "src/app/Model/Country";
import { Earthquake } from "src/app/Model/Earthquake";
import { DetailAlertComponent } from "./DetailAlert/DetailAlert.component";
import { Disaster } from "src/app/Model/Disaster";
import { CommonModule, Location } from "@angular/common";
import { SearchPlace } from "src/app/Modals/SearchPlace/SearchPlace.modal";
import { MapComponent } from "src/app/Map/Components/map/map.component";
import { SharedModule } from "src/app/Shared/Shared.module";
import { AlertsStore } from "src/app/Store/alerts/alerts.store";
import { Flood } from "src/app/Model/Flood";
import { Hurricane } from "src/app/Model/Hurricane";
import { DisastersFromAlertsStore } from "src/app/Store/disastersFromAlert/disastersFromAlert.store";

export class AlertVm {
  alert: Alert;
  country?: Country | null;
  layer: L.LayerGroup | null;
  visible: boolean;
}

@Component({
  templateUrl: './disaster.view.html',
  standalone: true,
  imports: [CommonModule, SharedModule, DisasterDetailComponent, DetailAlertComponent, SearchPlace, MapComponent],
  providers: [MarkerService, AlertsStore],
})
export class DisasterView implements OnInit {

  disastersMap?: L.Map;
  disastersLayer?: L.LayerGroup = new L.LayerGroup();
  selectedLayer?: L.LayerGroup = new L.LayerGroup();
  alertsLayer?: L.LayerGroup = new L.LayerGroup();
  alerts: AlertVm[];
  panel = '';
  lastPanel = '';

  earthquakes: Earthquake[];

  allVisible = true;

  protected cluster = new L.MarkerClusterGroup({ showCoverageOnHover: true, maxClusterRadius: 10, disableClusteringAtZoom: 15 });
  @ViewChild('detail') modalDetail?: DisasterDetailComponent;
  @ViewChild('detailalert') detailAlertPanel?: DetailAlertComponent;

  protected readonly alertsStore = inject(AlertsStore);
  protected readonly disastersFromAlertStore = inject(DisastersFromAlertsStore);

  #markerService = inject(MarkerService);
  #location = inject(Location);
  private restoringState = false;

  constructor() {
    this.selectPanel('area');

    effect(() => {
      this.alerts = this.alertsStore.alerts();
      this.displayAlertAreas();

      const disasters = this.disastersFromAlertStore.disasters();
      this.displayDisasters(disasters);

      if (this.restoringState && this.alerts.length > 0 && !this.alertsStore.isLoading()) {
        const alertId = this.disastersFromAlertStore.alertId();
        if (alertId) {
          const a = this.alerts.find(a => a.alert?.id === alertId);
          if (a && a.alert) {
            this.detailAlertPanel?.open(a.alert, true);
            this.selectPanel("detail-alert");
            this.zoomOnAlert(a.alert);
          }
        }
        this.restoringState = false;
      }
    });
  }

  ngOnInit(): void {
    const state: any = this.#location.getState();
    if (state && state.restoreState) {
      this.restoringState = true;
    } else {
      this.disastersFromAlertStore.reset();
    }
  }

  displayAlertAreas() {

    if (!this.disastersMap || !this.alertsLayer) return;

    this.alertsLayer.clearLayers();
    this.selectedLayer?.clearLayers();

    this.alerts.forEach((alert: AlertVm) => {
      if (!alert.layer) return;

      this.alertsLayer!.addLayer(alert.layer);
    })

    if (!this.disastersMap.hasLayer(this.alertsLayer)) {
      this.disastersMap.addLayer(this.alertsLayer);
    }
  }

  selectAlert(alert: Alert | undefined) {
    this.detailAlertPanel?.open(alert!);
    this.selectPanel("detail-alert");
    this.zoomOnAlert(alert!);
  }

  zoomOnAlert(alert: Alert) {
    this.alerts.filter(a => a.alert?.areas != null).forEach(a => {
      if (a.alert === alert) {
        //Fit on alert selected
        this.disastersMap?.fitBounds((a.layer as FeatureGroup).getBounds());
        if (!a.visible) {
          this.showAlertOnMap(a);
        }
      }
    })
  }

  closeAlert() {
    this.selectPanel('area');
    this.resetAleaLayer();
    this.resetSelectedAleaLayer();
    // this.disastersMap?.setView([0,0], 2);
    this.alerts.forEach(a => {
      if (!a.visible) {
        this.showAlertOnMap(a);
      }
    })
  }

  zoomOnDisaster(disaster: Disaster) {
    if (disaster.point != null) {
      //Fit on disaster selected
      this.selectedLayer?.clearLayers();
      this.disastersMap?.flyTo(new L.LatLng(disaster.point.coordinates[1], disaster.point.coordinates[0]), 7);
      switch (disaster.type) {
        case 'earthquake':
          this.#markerService.makeEarthquakeMarkers(this.disastersMap!, this.selectedLayer!, disaster as Earthquake, null, true, false, true);
          break;
        case 'flood':
          this.#markerService.makeFloodMarkers(this.disastersMap!, this.selectedLayer!, disaster as Flood, null, true, false, true);
          break;
        case 'hurricane':
          this.#markerService.makeHurricaneMarkers(this.disastersMap!, this.selectedLayer!, disaster as Hurricane, null, true, false, true);
          break;
        // case 'eruption':
        //   this.markerService.makeEruptionMarkers(this.disastersMap!, this.selectedLayer!, disaster as Eruption, null,true,false, true);
        //   break;
      }
    }
  }

  hoverOnDisaster(disaster: Disaster) {
    if (disaster.point != null) {
      //Fit on disaster selected
      this.selectedLayer?.clearLayers();
      switch (disaster.type) {
        case 'earthquake':
          this.#markerService.makeEarthquakeMarkers(this.disastersMap!, this.selectedLayer!, disaster as Earthquake, null, true, false, true);
          break;
        case 'flood':
          this.#markerService.makeFloodMarkers(this.disastersMap!, this.selectedLayer!, disaster as Flood, null, true, false, true);
          break;
        case 'hurricane':
          this.#markerService.makeHurricaneMarkers(this.disastersMap!, this.selectedLayer!, disaster as Hurricane, null, true, false, true);
          break;
        // case 'eruption':
        //   this.markerService.makeEruptionMarkers(this.disastersMap!, this.selectedLayer!, disaster as Eruption, null,true,false, true);
        //   break;
      }
    }
  }

  selectPanel(type: string) {
    if (this.panel === type) {
      this.hidePanels();
    }
    else {
      this.panel = type;
    }
  }

  hidePanels() {
    this.lastPanel = this.panel;
    this.panel = '';
  }

  closePanel() {
    this.hidePanels();
  }

  showAllAlertOnMap() {
    if (this.allVisible) {
      this.alerts.forEach(item => {
        if (item.alert.areas != null) {
          if (this.alertsLayer!.hasLayer(item.layer!)) {
            this.alertsLayer!.removeLayer(item.layer!);
          }
          item.visible = false;
        }
      });
      this.allVisible = false;
    } else {
      this.alerts.forEach(item => {
        if (item.alert.areas != null) {
          if (!this.alertsLayer!.hasLayer(item.layer!)) {
            this.alertsLayer!.addLayer(item.layer!);
          }
          item.visible = true;
        }
      });
      this.allVisible = true;
    }
  }

  showAlertOnMap(alertVm: AlertVm) {
    if (alertVm.layer != null) {
      if (this.alertsLayer!.hasLayer(alertVm?.layer!)) {
        this.alertsLayer!.removeLayer(alertVm?.layer!);
        alertVm.visible = false;
      } else {
        this.alertsLayer!.addLayer(alertVm.layer);
        alertVm.visible = true;
      }
    }
  }

  /**
   * Reset la couche des aléas sur la carte
   */
  resetAleaLayer() {
    if (this.disastersLayer != undefined) {
      this.cluster.clearLayers();
      this.disastersLayer.clearLayers();
    }
  }

  /**
   * Reset la couche des aléas sur la carte
   */
  resetSelectedAleaLayer() {
    if (this.selectedLayer != undefined) {
      this.selectedLayer.clearLayers();
    }
  }

  receiveMap(map: L.Map) {
    this.disastersMap = map;

    //Now we can load the alerts to display the areas on the map and add click event on the map to hide/show panels
    this.alertsStore.loadAlerts();
    this.disastersMap.on('click', (e) => {
      if (this.panel !== '') {
        this.hidePanels();
      }
      else {
        this.selectPanel(this.lastPanel);
      }
    });
  }

  displayDisasters(disastersPoint: Disaster[]) {
    this.resetAleaLayer();
    disastersPoint.forEach((item: Disaster) => {
      switch (item.type) {
        case 'earthquake':
          this.#markerService.makeEarthquakeMarkers(this.disastersMap!, this.disastersLayer!, item as Earthquake, null, true, true);
          break;
        case 'flood':
          this.#markerService.makeFloodMarkers(this.disastersMap!, this.disastersLayer!, item as Flood, null, true, true);
          break;
        case 'hurricane':
          this.#markerService.makeHurricaneMarkers(this.disastersMap!, this.disastersLayer!, item as Hurricane, null, true, true);
          break;
      }
    })
  }
}