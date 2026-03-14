import { Injectable } from '@angular/core';
import { Router, RouterStateSnapshot } from '@angular/router';
import { AuthentificationApi } from '../Services/AuthentificationApi.service';
import { ToastrService } from '../Shared/Services/Toastr.service';
import { ActivatedRouteSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class IsUserSignedIn {
    constructor(
        private router: Router,
        private authService: AuthentificationApi,
        private toastrService: ToastrService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

        console.log(this.authService.getToken());
        if (this.authService.getToken()) {
            // authorised so return true
            return true;
        }

        this.toastrService.warning("Connexion", "<a href='/login'>Vous devez-être connecté pour pouvoir accéder à cette page</a>");
        // not logged in so redirect to login page with the return url
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }
}