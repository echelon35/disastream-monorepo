import { TestBed } from '@angular/core/testing';
import { AlertsStore } from './alerts.store';
import { AlertApiService } from 'src/app/Services/AlertApiService';
import { GeographyApiService } from 'src/app/Services/GeographyApi.service';
import { MarkerService } from 'src/app/Map/Services/marker.service';
import { of, throwError } from 'rxjs';
import { Alert } from 'src/app/Model/Alert';
import { Country } from 'src/app/Model/Country';

describe('AlertsStore', () => {
    let store: InstanceType<typeof AlertsStore>;
    let mockAlertApiService: any;
    let mockGeographyService: any;
    let mockMarkerService: any;

    beforeEach(() => {
        mockAlertApiService = jasmine.createSpyObj('AlertApiService', ['getUserAlerts']);
        mockGeographyService = jasmine.createSpyObj('GeographyApiService', ['getCountryById']);
        mockMarkerService = jasmine.createSpyObj('MarkerService', ['makeAlertShapes']);

        TestBed.configureTestingModule({
            providers: [
                AlertsStore,
                { provide: AlertApiService, useValue: mockAlertApiService },
                { provide: GeographyApiService, useValue: mockGeographyService },
                { provide: MarkerService, useValue: mockMarkerService },
            ]
        });

        store = TestBed.inject(AlertsStore);
    });

    it('should initialize with default state', () => {
        expect(store.alerts()).toEqual([]);
        expect(store.isLoading()).toBeFalse();
        expect(store.error()).toBeNull();
    });

    it('should load alerts successfully w/ country', () => {
        const mockAlert: Alert = { id: 1, countryId: 'fr' } as any;
        const mockCountry: Country = { id: 'fr', name: 'France' } as any;
        const mockLayer = { layerId: 1 };

        mockAlertApiService.getUserAlerts.and.returnValue(of([mockAlert]));
        mockGeographyService.getCountryById.and.returnValue(of(mockCountry));
        mockMarkerService.makeAlertShapes.and.returnValue(mockLayer);

        store.loadAlerts();

        expect(store.isLoading()).toBeFalse();
        expect(store.alerts().length).toBe(1);

        const alertVm = store.alerts()[0];
        expect(alertVm.alert).toBe(mockAlert);
        expect(alertVm.country).toBe(mockCountry);
        expect(alertVm.layer).toBe(mockLayer as any);
        expect(alertVm.visible).toBeTrue();
    });

    it('should load alerts successfully w/o country', () => {
        const mockAlert: Alert = { id: 2, countryId: null } as any; // No countryId
        const mockLayer = { layerId: 2 };

        mockAlertApiService.getUserAlerts.and.returnValue(of([mockAlert]));
        mockMarkerService.makeAlertShapes.and.returnValue(mockLayer);

        store.loadAlerts();

        expect(store.isLoading()).toBeFalse();
        expect(store.alerts().length).toBe(1);

        const alertVm = store.alerts()[0];
        expect(alertVm.alert).toBe(mockAlert);
        expect(alertVm.country).toBeNull(); // Should be null
        expect(mockGeographyService.getCountryById).not.toHaveBeenCalled();
    });

    it('should handle error when fetching country', () => {
        const mockAlert: Alert = { id: 3, countryId: 'unknown' } as any;
        const mockLayer = { layerId: 3 };

        mockAlertApiService.getUserAlerts.and.returnValue(of([mockAlert]));
        mockGeographyService.getCountryById.and.returnValue(throwError(() => new Error('Country not found')));
        mockMarkerService.makeAlertShapes.and.returnValue(mockLayer);

        store.loadAlerts();

        expect(store.isLoading()).toBeFalse();
        expect(store.alerts().length).toBe(1);

        const alertVm = store.alerts()[0];
        expect(alertVm.alert).toBe(mockAlert);
        expect(alertVm.country).toBeNull(); // handled by catchError inside switchMap
    });

    it('should handle error when fetching alerts', () => {
        const errorMsg = 'Failed to fetch alerts';
        mockAlertApiService.getUserAlerts.and.returnValue(throwError(() => new Error(errorMsg)));

        store.loadAlerts();

        expect(store.isLoading()).toBeFalse();
        expect(store.error()).toBe(errorMsg);
        expect(store.alerts()).toEqual([]); // Should remain empty or previous state
    });

});
