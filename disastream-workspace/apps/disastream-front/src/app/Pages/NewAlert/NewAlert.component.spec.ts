
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewAlertView } from './NewAlert.component';
import { AlertApiService } from 'src/app/Services/AlertApiService';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'src/app/Shared/Services/Toastr.service';
import { PublicApiService } from 'src/app/Services/PublicApi.service';
import { GeographyApiService } from 'src/app/Services/GeographyApi.service';
import { ShapeService } from 'src/app/Map/Services/shape.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of, BehaviorSubject } from 'rxjs';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AddMailAlert } from 'src/app/Modals/AddMailAlert/AddMailAlert.modal';
import { EndAlertComponent } from 'src/app/Modals/EndAlert/EndAlert.modal';
import { SearchPlace } from 'src/app/Modals/SearchPlace/SearchPlace.modal';
import { MapComponent } from 'src/app/Map/Components/map/map.component';

// Mock child components
@Component({
    selector: 'app-mail-alert-modal',
    template: '',
    standalone: true
})
class MockAddMailAlert {
    open() { }
}

@Component({
    selector: 'app-end-alert-modal',
    template: '',
    standalone: true
})
class MockEndAlertComponent {
    @Input() alert: any;
    @Input() editMode: boolean = false;
    open() { }
    createAlert() { }
}

@Component({
    selector: 'app-search-place-modal',
    template: '',
    standalone: true
})
class MockSearchPlaceComponent {
    @Input() areaMap: any;
}

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
    @Input() locationBox: any;
    @Output() map$ = new EventEmitter<any>();
}

describe('NewAlertView', () => {
    let component: NewAlertView;
    let fixture: ComponentFixture<NewAlertView>;

    let mockAlertApiService: any;
    let mockRouter: any;
    let mockActivatedRoute: any;
    let mockToastrService: any;
    let mockPublicApiService: any;
    let mockGeographyApiService: any;
    let mockShapeService: any;

    beforeEach(async () => {
        mockAlertApiService = {
            getAlertById: jasmine.createSpy('getAlertById').and.returnValue(of({})),
            getMailAlerts: jasmine.createSpy('getMailAlerts').and.returnValue(of([]))
        };

        mockRouter = {
            navigateByUrl: jasmine.createSpy('navigateByUrl')
        };

        mockActivatedRoute = {
            snapshot: {
                queryParamMap: {
                    get: (key: string) => null
                }
            }
        };

        mockToastrService = jasmine.createSpyObj('ToastrService', ['success', 'error']);

        mockPublicApiService = {
            getAleasByCategory: jasmine.createSpy('getAleasByCategory').and.returnValue(of([])),
            getCriterias: jasmine.createSpy('getCriterias').and.returnValue(of([]))
        };

        mockGeographyApiService = {
            getCountries: jasmine.createSpy('getCountries').and.returnValue(of([]))
        };

        mockShapeService = {
            makeCountriesShape: jasmine.createSpy('makeCountriesShape')
        };

        await TestBed.configureTestingModule({
            imports: [NewAlertView, ReactiveFormsModule],
            providers: [
                { provide: AlertApiService, useValue: mockAlertApiService },
                { provide: Router, useValue: mockRouter },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: ToastrService, useValue: mockToastrService },
                { provide: PublicApiService, useValue: mockPublicApiService },
                { provide: GeographyApiService, useValue: mockGeographyApiService },
                { provide: ShapeService, useValue: mockShapeService },
                FormBuilder
            ]
        })
            .overrideComponent(NewAlertView, {
                remove: {
                    imports: [AddMailAlert, EndAlertComponent, SearchPlace, MapComponent]
                },
                add: {
                    imports: [MockAddMailAlert, MockEndAlertComponent, MockSearchPlaceComponent, MockMapComponent]
                }
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NewAlertView);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize data on validation', () => {
        expect(mockPublicApiService.getAleasByCategory).toHaveBeenCalled();
        expect(mockAlertApiService.getMailAlerts).toHaveBeenCalled();
    });

    it('should validate form on createAlert', () => {
        component.formGroup.controls['name'].setValue('');
        component.createAlert();
        expect(mockToastrService.error).toHaveBeenCalledWith('Alerte incomplète', 'Vous devez donner un nom à votre alerte');
    });

    it('should load map', () => {
        const mockMap = {
            pm: {
                setGlobalOptions: jasmine.createSpy('setGlobalOptions'),
                disableGlobalEditMode: jasmine.createSpy('disableGlobalEditMode'),
                enableDraw: jasmine.createSpy('enableDraw'),
                disableDraw: jasmine.createSpy('disableDraw'),
                enableGlobalEditMode: jasmine.createSpy('enableGlobalEditMode')
            },
            on: jasmine.createSpy('on')
        };

        component.receiveMap(mockMap as any);
        expect(component['areaMap']).toBe(mockMap as any);
    });

    it('should add a criterion', () => {
        const alea = { id: 1, name: 'Séisme', label: 'Séisme' };
        component.addCriterion(alea as any, 'Magnitude', '>', 5);
        expect(component.alert.criterias.length).toBe(1);
        expect(component.alert.criterias[0]).toEqual(jasmine.objectContaining({
            aleaId: 1,
            field: 'Magnitude',
            operator: '>',
            value: 5
        }));
    });

    it('should remove a criterion', () => {
        const alea = { id: 1, name: 'Séisme', label: 'Séisme' };
        component.addCriterion(alea as any, 'Magnitude', '>', 5);
        expect(component.alert.criterias.length).toBe(1);

        component.removeCriterion(0);
        expect(component.alert.criterias.length).toBe(0);
    });

});
