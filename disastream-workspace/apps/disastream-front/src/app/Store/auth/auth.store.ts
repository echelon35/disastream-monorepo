// auth.store.ts
import { signalStore, withState, withMethods, patchState, withHooks } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of, map } from 'rxjs';
import { effect, inject } from '@angular/core';
import { AuthState, initialState } from './auth.state';
import { Router } from '@angular/router';
import { AuthentificationApi } from 'src/app/Services/AuthentificationApi.service';
import { TokenDto } from 'src/app/DTO/token.dto';
import { UserStore } from '../user/user.store';
import { UserLoginDto } from 'src/app/DTO/UserLogin.dto';
import { ToastrService } from 'src/app/Shared/Services/Toastr.service';

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>(initialState),
  withMethods((store,
    authService = inject(AuthentificationApi),
    router = inject(Router),
    toastr = inject(ToastrService)
  ) => {

    /**
     * checkTokenValidity
     * - option: peut être appelé sans param (lire depuis store), ou avec un token
     * - met à jour isTokenValid / isAuthenticated correctement
     */
    const checkTokenValidity = rxMethod<string | void>(
      pipe(
        tap(() => {
          patchState(store, { loading: true, error: null });
          console.log('[AuthStore] Vérification du token...');
        }),
        switchMap((maybeToken) => {
          const token = typeof maybeToken === 'string' ? maybeToken : store.token();
          if (!token) {
            patchState(store, { isTokenValid: false, isAuthenticated: false, loading: false });
            return of(null);
          }

          return authService.checkExpiration().pipe(
            tap((isValid: boolean) => {
              if (isValid) {
                patchState(store, { isTokenValid: true, isAuthenticated: true, loading: false });
                console.log('[AuthStore] Token valide.');
              } else {
                // token invalide → nettoyage
                localStorage.removeItem('auth-token');
                patchState(store, { token: null, isTokenValid: false, isAuthenticated: false, loading: false });
                const errorMsg = 'Votre session a expiré, veuillez-vous reconnecter.';
                router.navigate(['/login'], { queryParams: { error: errorMsg, returnUrl: router.url !== '/login' ? router.url : undefined } });
                console.warn('[AuthStore] Token expiré.');
              }
            }),
            catchError((error) => {
              const msg = error?.message ?? 'Erreur lors de la vérification du token';
              patchState(store, { error: msg, isTokenValid: false, isAuthenticated: false, loading: false });
              localStorage.removeItem('auth-token');
              router.navigate(['/login'], { queryParams: { error: msg, returnUrl: router.url !== '/login' ? router.url : undefined } });
              console.error('[AuthStore] Erreur checkExpiration:', error);
              return of(null);
            })
          );
        })
      )
    );

    /**
     * login
     * - enregistre le token dans localStorage + state
     * - navigue vers la home (sans reload)
     */
    const login = rxMethod<UserLoginDto>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((payload) =>
          authService.login(payload).pipe(
            tap({
              next: (response: TokenDto) => {
                console.log('[AuthStore] Login OK, token reçu.');
                localStorage.setItem('auth-token', response.access_token);
                patchState(store, {
                  token: response.access_token,
                  isAuthenticated: true,
                  isTokenValid: true,
                  loading: false,
                  error: null,
                  userLoaded: false,
                });
                // navigation sans reload
                const parsedUrl = router.parseUrl(router.url);
                const returnUrl = parsedUrl.queryParams['returnUrl'] || '/';
                router.navigateByUrl(returnUrl).catch((e) => console.warn('[AuthStore] Navigation après login échouée', e));
              },
              error: (error) => {
                const msg = error?.message ?? 'Erreur lors de la connexion';
                patchState(store, { error: msg, loading: false });
                console.error('[AuthStore] Login error:', error);
                toastr.error(msg);
              }
            }),
            catchError((error) => {
              const msg = error?.message ?? 'Erreur lors de la connexion';
              patchState(store, { error: msg, loading: false });
              return of(null);
            })
          )
        )
      )
    );

    /**
     * logout
     * - supprime le token local et met l'état à jour
     * - navigue vers /login (ou / selon ton choix)
     */
    const logout = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        map(() => {
          // map juste pour propager la valeur, mais tous les side-effects en tap
        }),
        switchMap(() => {
          // Effectuer la suppression & patch dans un tap dans un of()
          return of(null).pipe(
            tap(() => {
              localStorage.removeItem('auth-token');
              patchState(store, {
                token: null,
                isTokenValid: false,
                isAuthenticated: false,
                loading: false,
                userLoaded: false,
              });
              router.navigate(['/login']).catch((e) => console.warn('[AuthStore] Navigation après logout échouée', e));
              console.log('[AuthStore] Déconnecté.');
            })
          );
        }),
        catchError((error) => {
          const msg = error?.message ?? 'Erreur lors de la déconnexion';
          patchState(store, { error: msg, loading: false });
          console.error('[AuthStore] Logout error:', error);
          return of(null);
        })
      )
    );

    return {
      checkTokenValidity,
      login,
      logout
    };
  }),
  withHooks({
    onInit(store) {
      const token = store.token();
      const userStore = inject(UserStore);
      console.log('[AuthStore] initialisé, token présent ?', !!token);

      // si token présent, vérifie sa validité
      if (token) {
        store.checkTokenValidity(token);
      }

      // Effet : quand l'auth change => charger l'utilisateur (si token valide)
      effect(() => {
        const authenticated = store.isAuthenticated();
        const valid = store.isTokenValid();
        // appelle getUser seulement si authentifié ET token valide
        if (authenticated && valid) {
          console.log('[AuthStore] isAuthenticated && isTokenValid -> charger user');
          userStore.getUser();
        }
      });
    }
  })
);
