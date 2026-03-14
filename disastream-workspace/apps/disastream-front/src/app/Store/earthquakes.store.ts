import { patchState, signalStore, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { Earthquake } from '../Model/Earthquake';
import { DisasterApiService } from '../Services/DisasterApiService';
import { inject } from '@angular/core';

type LoadEarthquakesState = {
  earthquakes: Earthquake[];
  isLoading: boolean;
  error: string | null;
};

const initialState: LoadEarthquakesState = {
  earthquakes: [],
  isLoading: false,
  error: null,
};

export const EarthquakesStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withProps(() => ({
        disasterApiService: inject(DisasterApiService),
    })),
    withMethods(({ disasterApiService, ...store }) => ({
        loadEarthquakes: () => {
            patchState(store, { isLoading: true });
            disasterApiService.searchEarthquakes().subscribe({
                next: (earthquakes) => {
                    patchState(store, {
                        earthquakes: (earthquakes ?? []).filter((eq): eq is Earthquake => eq !== undefined),
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
            })
        }
    })),
    withHooks({
        onInit: ({ loadEarthquakes, ...store }) => {
            loadEarthquakes();
        }
    })
);