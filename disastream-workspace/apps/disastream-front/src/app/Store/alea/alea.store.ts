import { patchState, signalStore, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { initialState } from './alea.state';
import { PublicApiService } from 'src/app/Services/PublicApi.service';
import { AleaCategoryDto } from 'src/app/DTO/AleaCategory.dto';
import { Alea } from 'src/app/Model/Alea';

export const AleasStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withProps(() => ({
        publicApiService: inject(PublicApiService)
    })),
    withMethods(({ publicApiService, ...store }) => ({
        loadAleas: () => {
            patchState(store, { isLoading: true });
            publicApiService.getAleasByCategory().subscribe({
                next: (aleasWithCategory: AleaCategoryDto[]) => {
                    const aleas = aleasWithCategory.map(aleaWithCategory => {
                        const alea = new Alea();
                        alea.id = aleaWithCategory.alea_id;
                        alea.name = aleaWithCategory.alea_name;
                        alea.label = aleaWithCategory.alea_label;
                        return alea;
                    });
                    patchState(store, {
                        aleas: aleas,
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
        onInit(store) {
            store.loadAleas();
        }
    })
);
