import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailAlertComponent } from './DetailAlert.component';
import { DisastersFromAlertsStore } from 'src/app/Store/disastersFromAlert/disastersFromAlert.store';
import { AlertApiService } from 'src/app/Services/AlertApiService';
import { ToastrService } from 'src/app/Shared/Services/Toastr.service';
import { of } from 'rxjs';
import { Alert } from 'src/app/Model/Alert';
import { signal } from '@angular/core';
import { HttpClient } from "@angular/common/http";

describe('DetailAlertComponent', () => {
  let component: DetailAlertComponent;
  let fixture: ComponentFixture<DetailAlertComponent>;
  let mockDisastersFromAlertsStore: any;
  let mockAlertApiService: any;
  let mockToastrService: any;
  let mockHttpService: any;

  beforeEach(async () => {
    mockDisastersFromAlertsStore = {
      disasters: signal([]),
      filter: signal('premier_releve'),
      disasterCount: signal(0),
      isLoading: signal(false),
      currentPage: signal(1),
      limit: signal(20),
      changeCity: jasmine.createSpy('changeCity'),
      loadDisasterFromAlerts: jasmine.createSpy('loadDisasterFromAlerts'),
      changeCountry: jasmine.createSpy('changeCountry'),
      changePremierReleve: jasmine.createSpy('changePremierReleve'),
      changeDernierReleve: jasmine.createSpy('changeDernierReleve'),
      reset: jasmine.createSpy('reset'),
      setAlert: jasmine.createSpy('setAlert'),
      changeFilter: jasmine.createSpy('changeFilter'),
      changeOrder: jasmine.createSpy('changeOrder'),
      changePage: jasmine.createSpy('changePage'),
      withCriterias: jasmine.createSpy('withCriterias'),
    };

    mockAlertApiService = {
      activateAlert: jasmine.createSpy('activateAlert').and.returnValue(of({})),
    };

    mockToastrService = {
      info: jasmine.createSpy('info'),
    };

    mockHttpService = {
      get: jasmine.createSpy('get').and.returnValue(of({})),
    };

    await TestBed.configureTestingModule({
      imports: [DetailAlertComponent],
      providers: [
        { provide: DisastersFromAlertsStore, useValue: mockDisastersFromAlertsStore },
        { provide: AlertApiService, useValue: mockAlertApiService },
        { provide: ToastrService, useValue: mockToastrService },
        { provide: HttpClient, useValue: mockHttpService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset filters correctly', () => {
    component.filterCity = 'Paris';
    component.filterCountry = 'France';
    component.razFilters();
    expect(component.filterCity).toBe('');
    expect(component.filterCountry).toBe('');
    expect(component.currentFilter).toBe('premier_releve');
  });

  it('should call activateAlert service', () => {
    const alertMock: Alert = { id: 1, isActivate: false } as Alert;
    component.alert = alertMock;
    component.activateAlert();
    expect(mockAlertApiService.activateAlert).toHaveBeenCalledWith(1, true);
    expect(mockToastrService.info).toHaveBeenCalledWith('Alerte activée');
    expect(component.alert!.isActivate).toBeTrue();
  });

  it('should call disableAlert service', () => {
    const alertMock: Alert = { id: 1, isActivate: true } as unknown as Alert;
    component.alert = alertMock;
    component.disableAlert();
    expect(mockAlertApiService.activateAlert).toHaveBeenCalledWith(1, false);
    expect(mockToastrService.info).toHaveBeenCalledWith('Alerte désactivée');
    expect(component.alert!.isActivate).toBeFalse();
  });

  it('should update city filter and load disasters', () => {
    component.filterCity = 'Lyon';
    component.searchCity();
    expect(mockDisastersFromAlertsStore.changeCity).toHaveBeenCalledWith('Lyon');
    expect(mockDisastersFromAlertsStore.loadDisasterFromAlerts).toHaveBeenCalled();
  });

  it('should clear city filter and load disasters', () => {
    component.filterCity = 'Lyon';
    component.clearCity();
    expect(mockDisastersFromAlertsStore.changeCity).toHaveBeenCalledWith('');
    expect(component.filterCity).toBe('');
    expect(mockDisastersFromAlertsStore.loadDisasterFromAlerts).toHaveBeenCalled();
  });

  it('should update country filter and load disasters', () => {
    component.filterCountry = 'France';
    component.searchCountry();
    expect(mockDisastersFromAlertsStore.changeCountry).toHaveBeenCalledWith('France');
    expect(mockDisastersFromAlertsStore.loadDisasterFromAlerts).toHaveBeenCalled();
  });

  it('should clear country filter and load disasters', () => {
    component.filterCountry = 'France';
    component.clearCountry();
    expect(mockDisastersFromAlertsStore.changeCountry).toHaveBeenCalledWith('');
    expect(component.filterCountry).toBe('');
    expect(mockDisastersFromAlertsStore.loadDisasterFromAlerts).toHaveBeenCalled();
  });

  it('should open alert and reset store', () => {
    const alertMock: Alert = { id: 123 } as unknown as Alert;
    component.open(alertMock);
    expect(component.alert).toBe(alertMock);
    expect(mockDisastersFromAlertsStore.reset).toHaveBeenCalled();
    expect(mockDisastersFromAlertsStore.setAlert).toHaveBeenCalledWith(123);
    expect(mockDisastersFromAlertsStore.loadDisasterFromAlerts).toHaveBeenCalled();
  });

  it('should change order and reload', () => {
    component.orderBy('city');
    expect(mockDisastersFromAlertsStore.changeFilter).toHaveBeenCalledWith('city');
    // Default mock behavior if not set on component properties
    expect(mockDisastersFromAlertsStore.changeOrder).toHaveBeenCalled();
    expect(mockDisastersFromAlertsStore.changePage).toHaveBeenCalledWith(1);
    expect(mockDisastersFromAlertsStore.loadDisasterFromAlerts).toHaveBeenCalled();
  });

  it('should change page and reload', () => {
    component.changePage(2);
    expect(mockDisastersFromAlertsStore.changePage).toHaveBeenCalledWith(2);
    expect(mockDisastersFromAlertsStore.loadDisasterFromAlerts).toHaveBeenCalled();
  });
});
