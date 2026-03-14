import { Component, effect, inject, output } from '@angular/core';
import { Alert } from 'src/app/Model/Alert';
import { Disaster } from 'src/app/Model/Disaster';
import { AlertApiService } from 'src/app/Services/AlertApiService';
import { ToastrService } from 'src/app/Shared/Services/Toastr.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipeModule } from 'src/app/PipeModule/pipe.module';
import { SharedModule } from 'src/app/Shared/Shared.module';
import { DisastersFromAlertsStore } from 'src/app/Store/disastersFromAlert/disastersFromAlert.store';
import { Alea } from 'src/app/Model/Alea';
import { AleasStore } from 'src/app/Store/alea/alea.store';

interface Filter {
  name: string;
  order: string;
}

@Component({
  selector: 'app-detail-alert',
  templateUrl: './DetailAlert.component.html',
  standalone: true,
  imports: [CommonModule, SharedModule, ReactiveFormsModule, FormsModule, PipeModule]
})
export class DetailAlertComponent {

  private readonly DisastersFromAlertStore = inject(DisastersFromAlertsStore);
  private readonly AleaStore = inject(AleasStore);

  alert?: Alert;
  close$ = output<boolean>();
  zoomAlert$ = output<Alert>();
  zoomDisaster$ = output<Disaster>();
  hoverDisaster$ = output<Disaster>();
  closePanel$ = output<void>();
  disastersToDisplay$ = output<Disaster[]>();
  historyDisasters: Disaster[] = [];
  count = 0;
  counted = false;
  allCount = 0;
  load = false;
  expandPanel = false;

  currentFilter = 'premier_releve';
  currentOrder = 'ASC';
  filters: Filter[] = [
    { name: 'premier_releve', order: 'ASC' },
    { name: 'dernier_releve', order: 'ASC' },
    { name: 'power', order: 'ASC' },
    { name: 'type', order: 'ASC' },
    { name: 'country', order: 'ASC' },
    { name: 'city', order: 'ASC' }
  ];
  filterCountry = '';
  filterCity = '';
  now = new Date();
  filterFrom = new Date('2000-01-01').toISOString().split('T').shift();
  filterTo = new Date().toISOString().split('T').shift();

  //Pagination
  currentPage = 1;
  nbPage = 0;
  limit = 20;
  strictMode = true;
  aleas: Alea[] = [];

  constructor(private alertApiService: AlertApiService,
    private toastrService: ToastrService) {

    effect(() => {
      this.aleas = this.AleaStore.aleas();
      this.historyDisasters = this.DisastersFromAlertStore.disasters();
      this.currentFilter = this.DisastersFromAlertStore.filter();
      this.count = this.DisastersFromAlertStore.disasterCount();
      this.load = this.DisastersFromAlertStore.isLoading();
      this.currentPage = this.DisastersFromAlertStore.currentPage();
      this.nbPage = Math.ceil(this.DisastersFromAlertStore.disasterCount() / this.DisastersFromAlertStore.limit());
      this.strictMode = this.DisastersFromAlertStore.withCriterias();

      if (!this.counted && this.count > 0) {
        this.allCount = this.count;
        this.counted = true;
      }
    });
  }

  razFilters() {
    this.filterCity = '';
    this.filterCountry = '';
    this.filterFrom = new Date('2000-01-01').toISOString().split('T').shift();
    this.filterTo = new Date().toISOString().split('T').shift();
    this.currentFilter = 'premier_releve';
    this.currentOrder = 'ASC';
    this.filters.forEach(f => f.order = 'ASC');
  }

  back() {
    this.alert = undefined;
    this.close$.emit(true);
  }

  expand(expand: boolean) {
    this.expandPanel = expand;
  }

  changeStrict() {
    this.DisastersFromAlertStore.changeStrictMode(this.strictMode);
    this.DisastersFromAlertStore.loadDisasterFromAlerts();
  }

  disableAlert() {
    const id = this.alert!.id;
    this.alertApiService.activateAlert(id, false).subscribe(() => {
      this.toastrService.info('Alerte désactivée');
      this.alert!.isActivate = false;
    });
  }

  activateAlert() {
    const id = this.alert!.id;
    this.alertApiService.activateAlert(id, true).subscribe(() => {
      this.toastrService.info('Alerte activée');
      this.alert!.isActivate = true;
    });
  }

  searchCity() {
    this.DisastersFromAlertStore.changeCity(this.filterCity);
    this.DisastersFromAlertStore.loadDisasterFromAlerts();
  }

  clearCity() {
    this.DisastersFromAlertStore.changeCity('');
    this.filterCity = '';
    this.DisastersFromAlertStore.loadDisasterFromAlerts();
  }

  searchCountry() {
    this.DisastersFromAlertStore.changeCountry(this.filterCountry);
    this.DisastersFromAlertStore.loadDisasterFromAlerts();
  }

  clearCountry() {
    this.DisastersFromAlertStore.changeCountry('');
    this.filterCountry = '';
    this.DisastersFromAlertStore.loadDisasterFromAlerts();
  }

  searchFrom(event: any) {
    if (event.target.value.length > 0) {
      this.filterFrom = event.target.value;
      this.DisastersFromAlertStore.changePremierReleve(this.filterFrom!);
      this.DisastersFromAlertStore.loadDisasterFromAlerts();
    }
  }

  searchTo(event: any) {
    if (event.target.value.length > 0) {
      this.filterTo = event.target.value;
      this.DisastersFromAlertStore.changeDernierReleve(this.filterTo!);
      this.DisastersFromAlertStore.loadDisasterFromAlerts();
    }
  }

  open(alert: Alert | undefined, isRestore: boolean = false) {
    this.alert = undefined;
    if (alert != null) {
      this.alert = alert;
      if (!isRestore) {
        this.razFilters();
        this.DisastersFromAlertStore.reset();
      }
      this.DisastersFromAlertStore.setAlert(alert!.id);
      if (!isRestore) {
        this.DisastersFromAlertStore.loadDisasterFromAlerts();
      }
    }
  }

  zoomOnAlert() {
    this.zoomAlert$.emit(this.alert!);
  }

  zoomOnDisaster(disaster: Disaster) {
    this.zoomDisaster$.emit(disaster);
    this.closePanel();
  }

  closePanel() {
    this.closePanel$.emit();
  }

  hoverOnDisaster(disaster: Disaster) {
    this.hoverDisaster$.emit(disaster);
  }

  senseOfOrder(filter: string): string {
    const f = this.filters.find(f => f.name == filter);
    if (f != null) {
      return f.order;
    }
    return 'ASC';
  }

  orderBy(filter: string) {
    this.DisastersFromAlertStore.changeFilter(filter);

    this.currentOrder = (this.filters.find(f => f.name == filter)?.order === 'ASC') ? 'DESC' : 'ASC';
    this.DisastersFromAlertStore.changeOrder(this.currentOrder);
    this.filters.forEach(f => {
      if (f.name == filter) {
        f.order = this.currentOrder;
      } else {
        f.order = 'ASC';
      }
    });
    this.DisastersFromAlertStore.changePage(1);
    this.DisastersFromAlertStore.loadDisasterFromAlerts();
  }

  changePage(page: number) {
    this.DisastersFromAlertStore.changePage(page);
    this.DisastersFromAlertStore.loadDisasterFromAlerts();
  }

  getAleaLabel(aleaId: number): string {
    const alea = this.aleas.find(a => a.id === aleaId);
    return alea ? alea.label : 'Alea inconnu';
  }

  isExpired(): boolean {
    if (!this.alert?.expirationDate) return false;
    return new Date(this.alert.expirationDate) < new Date();
  }

}
