import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DisasterView, AlertVm } from './disaster.view';
import { AlertsStore } from 'src/app/Store/alerts/alerts.store';
import { DisastersFromAlertsStore } from 'src/app/Store/disastersFromAlert/disastersFromAlert.store';
import { MarkerService } from 'src/app/Map/Services/marker.service';
import { signal, Component, Input, Output, EventEmitter } from '@angular/core';
import { Alert } from 'src/app/Model/Alert';
import { Disaster } from 'src/app/Model/Disaster';
import * as L from 'leaflet';
import { MapComponent } from 'src/app/Map/Components/map/map.component';
import { DetailAlertComponent } from './DetailAlert/DetailAlert.component';
import { DisasterDetailComponent } from 'src/app/Modals/DisasterDetail/disaster-detail.component';
import { SearchPlace } from 'src/app/Modals/SearchPlace/SearchPlace.modal';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/Shared/Shared.module';


// Mock Leaflet
const mockMap = {
    addLayer: jasmine.createSpy('addLayer'),
    removeLayer: jasmine.createSpy('removeLayer'),
    hasLayer: jasmine.createSpy('hasLayer').and.returnValue(false),
    setView: jasmine.createSpy('setView'),
    fitBounds: jasmine.createSpy('fitBounds'),
    flyTo: jasmine.createSpy('flyTo'),
    on: jasmine.createSpy('on'),
    clearLayers: jasmine.createSpy('clearLayers'),
};

const mockLayerGroup = {
    clearLayers: jasmine.createSpy('clearLayers'),
    addLayer: jasmine.createSpy('addLayer'),
    removeLayer: jasmine.createSpy('removeLayer'),
    hasLayer: jasmine.createSpy('hasLayer').and.returnValue(false),
};

const mockMarkerClusterGroup = {
    clearLayers: jasmine.createSpy('clearLayers'),
    addLayer: jasmine.createSpy('addLayer'),
};

// Mock Components
@Component({
    selector: 'app-map',
    template: '',
    standalone: true
})
class MockMapComponent {
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
    @Output() map$ = new EventEmitter<L.Map>();
}

@Component({
    selector: 'app-detail-alert',
    template: '',
    standalone: true
})
class MockDetailAlertComponent {
    @Output() close$ = new EventEmitter<boolean>();
    @Output() zoomAlert$ = new EventEmitter<Alert>();
    @Output() zoomDisaster$ = new EventEmitter<Disaster>();
    @Output() hoverDisaster$ = new EventEmitter<Disaster>();
    @Output() closePanel$ = new EventEmitter<void>();
    open(alert: Alert) { }
}

@Component({
    selector: 'app-disaster-detail',
    template: '',
    standalone: true
})
class MockDisasterDetailComponent { }

@Component({
    selector: 'app-search-place-modal',
    template: '',
    standalone: true
})
class MockSearchPlaceComponent {
    @Input() areaMap: any;
}

describe('DisasterView', () => {
    let component: DisasterView;
    let fixture: ComponentFixture<DisasterView>;
    let mockAlertsStore: any;
    let mockDisastersFromAlertsStore: any;
    let mockMarkerService: any;

    beforeEach(async () => {
        mockAlertsStore = {
            alerts: signal([]),
            isLoading: signal(false),
            loadAlerts: jasmine.createSpy('loadAlerts'),
        };

        mockDisastersFromAlertsStore = {
            disasters: signal([]),
            reset: jasmine.createSpy('reset')
        };

        mockMarkerService = {
            makeEarthquakeMarkers: jasmine.createSpy('makeEarthquakeMarkers'),
            makeFloodMarkers: jasmine.createSpy('makeFloodMarkers'),
            makeHurricaneMarkers: jasmine.createSpy('makeHurricaneMarkers'),
        };

        await TestBed.configureTestingModule({
            imports: [DisasterView],
            providers: [
                { provide: AlertsStore, useValue: mockAlertsStore },
                { provide: DisastersFromAlertsStore, useValue: mockDisastersFromAlertsStore },
                { provide: MarkerService, useValue: mockMarkerService },
            ],
        })
            .overrideComponent(DisasterView, {
                set: {
                    imports: [
                        CommonModule,
                        SharedModule,
                        MockMapComponent,
                        MockDetailAlertComponent,
                        MockDisasterDetailComponent,
                        MockSearchPlaceComponent
                    ],
                    providers: [
                        { provide: AlertsStore, useValue: mockAlertsStore },
                        { provide: MarkerService, useValue: mockMarkerService },
                    ]
                }
            })
            .compileComponents();

        fixture = TestBed.createComponent(DisasterView);
        component = fixture.componentInstance;

        // Mock internal leaflet properties
        component.disastersMap = mockMap as any;
        component.alertsLayer = mockLayerGroup as any;
        component.disastersLayer = mockLayerGroup as any;
        component.selectedLayer = mockLayerGroup as any;
        // @ts-ignore
        component.cluster = mockMarkerClusterGroup as any;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call loadAlerts on map receipt', () => {
        component.receiveMap(mockMap as any);
        expect(component.disastersMap).toBe(mockMap as any);
        expect(mockAlertsStore.loadAlerts).toHaveBeenCalled();
        expect(mockMap.on).toHaveBeenCalledWith('click', jasmine.any(Function));
    });

    it('should display alert areas', () => {
        const alertVm: AlertVm = {
            alert: { id: 1 } as unknown as Alert,
            layer: mockLayerGroup as any,
            visible: true
        };
        mockAlertsStore.alerts.set([alertVm]);

        // Trigger effect by updating signal or calling method directly if effect is not triggered in test env easily
        component.alerts = [alertVm];
        component.displayAlertAreas();

        expect(component.alertsLayer!.addLayer).toHaveBeenCalledWith(alertVm.layer!);
        expect(mockMap.addLayer).toHaveBeenCalledWith(component.alertsLayer!);
    });

    it('should select panel', () => {
        component.selectPanel('test');
        expect(component.panel).toBe('test');

        component.selectPanel('test');
        expect(component.panel).toBe('');
    });

    it('should display disasters', () => {
        const disaster: Disaster = { type: 'earthquake' } as Disaster;
        component.displayDisasters([disaster]);

        expect(mockMarkerService.makeEarthquakeMarkers).toHaveBeenCalled();
    });

    it('should zoom on alert', () => {
        const alert = { id: 1, name: 'Test Alert', areas: ['area1'] } as unknown as Alert;
        const mockLayer = { getBounds: jasmine.createSpy('getBounds').and.returnValue({} as L.LatLngBounds) };
        const mockAlertVm = { alert: alert, layer: mockLayer, visible: false } as any;

        component.alerts = [mockAlertVm];
        component.disastersMap = mockMap as any;

        spyOn(component, 'showAlertOnMap');

        component.zoomOnAlert(alert);

        expect(mockLayer.getBounds).toHaveBeenCalled();
        expect(mockMap.fitBounds).toHaveBeenCalled();
    });

    it('should zoom on disaster', () => {
        const disaster: Disaster = {
            type: 'earthquake',
            point: { coordinates: [10, 20] }
        } as unknown as Disaster;

        component.zoomOnDisaster(disaster);

        expect(mockMap.flyTo).toHaveBeenCalled();
        expect(mockMarkerService.makeEarthquakeMarkers).toHaveBeenCalled(); // for selected layer
    });

    it('should close alert', () => {
        spyOn(component, 'selectPanel');
        spyOn(component, 'resetAleaLayer');
        spyOn(component, 'resetSelectedAleaLayer');

        component.closeAlert();

        expect(component.selectPanel).toHaveBeenCalledWith('area');
        expect(component.resetAleaLayer).toHaveBeenCalled();
        expect(component.resetSelectedAleaLayer).toHaveBeenCalled();
    });

    it('should remove markers from map after changing alert', () => {
        // Reset spies to ensure clean state
        (mockMarkerClusterGroup.clearLayers as jasmine.Spy).calls.reset();
        (mockLayerGroup.clearLayers as jasmine.Spy).calls.reset();

        // Simulate changing alert which triggers displayDisasters
        component.displayDisasters([]);

        // Verify layers are cleared
        expect((component as any).cluster.clearLayers).toHaveBeenCalled();
        expect(component.disastersLayer?.clearLayers).toHaveBeenCalled();
    });

});
