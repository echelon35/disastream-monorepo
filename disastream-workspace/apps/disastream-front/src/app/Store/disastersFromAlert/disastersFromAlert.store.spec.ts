import { TestBed } from '@angular/core/testing';
import { DisastersFromAlertsStore } from './disastersFromAlert.store';
import { AlertApiService } from 'src/app/Services/AlertApiService';
import { MarkerService } from 'src/app/Map/Services/marker.service';
import { of, throwError } from 'rxjs';
import { DisasterAlertDto } from 'src/app/DTO/DisasterAlertDto';
import { Earthquake } from 'src/app/Model/Earthquake';
import { Flood } from 'src/app/Model/Flood';

describe('DisastersFromAlertsStore', () => {
    let store: InstanceType<typeof DisastersFromAlertsStore>;
    let mockAlertApiService: any;
    let mockMarkerService: any;

    beforeEach(() => {
        mockAlertApiService = jasmine.createSpyObj('AlertApiService', ['getDisastersAlerts']);
        mockMarkerService = jasmine.createSpyObj('MarkerService', ['']); // No methods used in store currently, but good to have

        TestBed.configureTestingModule({
            providers: [
                DisastersFromAlertsStore,
                { provide: AlertApiService, useValue: mockAlertApiService },
                { provide: MarkerService, useValue: mockMarkerService },
            ]
        });

        store = TestBed.inject(DisastersFromAlertsStore);
    });

    it('should initialize with default state', () => {
        expect(store.disasters()).toEqual([]);
        expect(store.isLoading()).toBeFalse();
        expect(store.currentPage()).toBe(1);
        expect(store.filter()).toBe('premier_releve');
        expect(store.order()).toBe('ASC');
    });

    it('should load disasters successfully and map types', () => {
        const mockDisasters: DisasterAlertDto = {
            count: 2,
            disasters: [
                {
                    type: 'earthquake',
                    id: 1,
                    magnitude: 5.0,
                    city: 'Test City',
                    country: 'Test Country',
                    sourceName: 'Source',
                    sourceAddress: 'http://source',
                    date: new Date()
                } as any,
                {
                    type: 'flood',
                    id: 2,
                    surface: {},
                    city: 'Test City',
                    country: 'Test Country',
                    sourceName: 'Source',
                    sourceAddress: 'http://source',
                    date: new Date()
                } as any
            ]
        };

        mockAlertApiService.getDisastersAlerts.and.returnValue(of(mockDisasters));

        store.loadDisasterFromAlerts();

        expect(store.isLoading()).toBeFalse();
        expect(store.disasterCount()).toBe(2);
        expect(store.disasters().length).toBe(2);
        expect(store.disasters()[0]).toBeInstanceOf(Earthquake);
        expect(store.disasters()[1]).toBeInstanceOf(Flood);
    });

    it('should handle error when loading disasters', () => {
        const errorMsg = 'Failed to load';
        mockAlertApiService.getDisastersAlerts.and.returnValue(throwError(() => new Error(errorMsg)));

        store.loadDisasterFromAlerts();

        expect(store.isLoading()).toBeFalse();
        expect(store.error()).toBe(errorMsg);
        expect(store.disasters()).toEqual([]);
    });

    it('should update state with setters', () => {
        store.setAlert(123);
        expect(store.alertId()).toBe(123);

        store.changePage(2);
        expect(store.currentPage()).toBe(2);

        store.changeFilter('test_filter');
        expect(store.filter()).toBe('test_filter');

        store.changeOrder('DESC');
        expect(store.order()).toBe('DESC');

        store.changeCountry('France');
        expect(store.country()).toBe('France');

        store.changeCity('Paris');
        expect(store.city()).toBe('Paris');
    });

    it('should reset state', () => {
        // Set some state
        store.changePage(5);
        store.changeFilter('custom');

        // Reset
        store.reset();

        expect(store.currentPage()).toBe(1);
        expect(store.filter()).toBe('premier_releve');
        expect(store.order()).toBe('ASC');
        expect(store.country()).toBe('');
        expect(store.disasters()).toEqual([]);
        expect(store.disasterCount()).toBe(0);
    });

});
