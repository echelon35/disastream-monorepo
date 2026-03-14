import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { AlertApiService } from 'src/app/Services/AlertApiService';
import { MarkerService } from 'src/app/Map/Services/marker.service';
import { initialState } from './disastersFromAlert.state';
import { DisasterAlertDto } from 'src/app/DTO/DisasterAlertDto';
import { Disaster } from 'src/app/Model/Disaster';
import { Earthquake } from 'src/app/Model/Earthquake';
import { Flood } from 'src/app/Model/Flood';
import { Hurricane } from 'src/app/Model/Hurricane';
import { Eruption } from 'src/app/Model/Eruption';
import { DisasterFromAlertDtoEarthquake, DisasterFromAlertDtoEruption, DisasterFromAlertDtoFlood, DisasterFromAlertDtoHurricane } from 'src/app/DTO/DisasterFromAlertDto';

export const DisastersFromAlertsStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withProps(() => ({
        alertApiService: inject(AlertApiService),
        markerService: inject(MarkerService),
    })),
    withMethods(({ alertApiService, markerService, ...store }) => {
        const loadDisasterFromAlerts = () => {
            patchState(store, { isLoading: true });
            alertApiService.getDisastersAlerts(store.alertId(), store.currentPage(), store.filter(), store.order(), store.country(), store.city(), store.premier_releve(), store.dernier_releve(), store.withCriterias()).subscribe({
                next: (disasterAlerts: DisasterAlertDto) => {
                    const disastersFound: Disaster[] = [];
                    disasterAlerts.disasters.forEach(d => {
                        switch (d.type) {
                            case 'earthquake':
                            disastersFound.push(new Earthquake(d as DisasterFromAlertDtoEarthquake));
                            break;
                            case 'flood':
                            disastersFound.push(new Flood(d as DisasterFromAlertDtoFlood));
                            break;
                            case 'hurricane':
                            disastersFound.push(new Hurricane(d as DisasterFromAlertDtoHurricane));
                            break;
                            case 'eruption':
                            disastersFound.push(new Eruption(d as DisasterFromAlertDtoEruption));
                            break;
                        }
                    });
                    patchState(store, {
                        disasters: disastersFound,
                        disasterCount: disasterAlerts.count,
                        isLoading: false,
                        error: null,
                    });
                },
                error: (error) => {
                    patchState(store, {
                        isLoading: false,
                        error: error.message || 'Unknown error',
                    });
                },
            });
        };

        const setAlert = (alertId: number) => {
            patchState(store, { alertId });
        };

        const changePage = (page: number) => {
            patchState(store, { currentPage: page });
        };

        const changeFilter = (filter: string) => {
            patchState(store, { filter });
        };

        const changeStrictMode = (strictMode: boolean) => {
            patchState(store, { withCriterias: strictMode });
        };

        const changeOrder = (order: string) => {
            patchState(store, { order });
        };

        const changeCountry = (country: string) => {
            patchState(store, { country });
        };

        const changeCity = (city: string) => {
            patchState(store, { city });
        };

        const changePremierReleve = (premier_releve: string) => {
            patchState(store, { premier_releve });
        };

        const changeDernierReleve = (dernier_releve: string) => {
            patchState(store, { dernier_releve });
        };

        const reset = () => {
            patchState(store, {
                currentPage: 1,
                filter: 'premier_releve',
                order: 'ASC',
                country: '',
                city: '',
                premier_releve: '',
                dernier_releve: '',
                disasterCount: 0,
                nbPages: 0,
                disasters: [],
            });
        };

        return {
            loadDisasterFromAlerts,
            changePage,
            changeFilter,
            changeOrder,
            changeCountry,
            changeCity,
            changePremierReleve,
            changeDernierReleve,
            setAlert,
            changeStrictMode,
            reset
        };
    })
);