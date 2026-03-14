import { computed, inject } from "@angular/core";
import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from "@ngrx/signals";
import { initialState } from "./user.state";
import { pipe, switchMap, tap } from "rxjs";
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { User } from "src/app/Model/User";
import { UserApiService } from "src/app/Services/UserApiService";

export const UserStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((store, 
        userApiService = inject(UserApiService)) => {
        function updateUser(user: User) {
            console.log('Updating user by UserStore:', user);
            patchState(store, { user });
        }
        const getUser = rxMethod<void> (
            pipe(
                switchMap(() => userApiService.getMyProfile()),
                tap((user: User) => {
                    console.log('Get user by UserStore:', user);
                    updateUser(user);
                })
            )
        );
        // const changeAvatar = (avatar: Media) => {
        //     patchState(store, { user: { ...store.user(), avatar } });
        // };
        const resetUser = () => {
            console.log('Resetting user by UserStore:');
            patchState(store, initialState);
        };
        return {
            updateUser,
            getUser,
            // changeAvatar,
            resetUser
        };
    }),
    withProps((store) => ({
        userAvatar$: store.user().avatar
    })),
    withComputed(({ user }) => ({
        firstname: computed(() => user.firstname != null ? user.firstname() : user.username()),
    })))
    withHooks({
        onInit(store) {
            store['getUser']();
        }
    });