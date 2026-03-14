import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { AlertApiService } from 'src/app/Services/AlertApiService';
import { AlertVm } from 'src/app/Pages/DisasterView/disaster.view';
import { GeographyApiService } from 'src/app/Services/GeographyApi.service';
import { MarkerService } from 'src/app/Map/Services/marker.service';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { initialState } from './alerts.state';

export const AlertsStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withProps(() => ({
        alertApiService: inject(AlertApiService),
        geographyService: inject(GeographyApiService),
        markerService: inject(MarkerService),
    })),
    withMethods(({ alertApiService, geographyService, markerService, ...store }) => ({
        loadAlerts: () => {
            patchState(store, { isLoading: true });
            alertApiService.getUserAlerts().pipe(
                switchMap(alerts => {
                    const alertWithCountry = alerts.map(alert => {
                        if(!alert.countryId){
                            return of({ alert, country: null });
                        }
                        return geographyService.getCountryById(alert.countryId).pipe(
                            map(country => ({ alert, country })),
                            catchError(() => of({ alert, country: null }))
                        );
                    });
                    return forkJoin(alertWithCountry);
                })
            ).subscribe({
                next: (alertsWithCountry) => {
                    const alertVms = alertsWithCountry.map((a => {
                        const alertVm = new AlertVm();
                        alertVm.alert = a.alert;
                        alertVm.country = a.country;
                        alertVm.layer = markerService.makeAlertShapes(a.alert);
                        alertVm.visible = true;
                        return alertVm;
                    }));
                    patchState(store, {
                        alerts: alertVms,
                        isLoading: false,
                        error: null,
                    });
                },
                error: (error) => {
                    patchState(store, {
                        isLoading: false,
                        error: error.message || 'Unknown error',
                    });
                }
            }).add(() => {
                patchState(store, { isLoading: false });
            });
        }
    }))
);