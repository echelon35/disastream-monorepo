import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthentificationApi } from '../Services/AuthentificationApi.service';

@Injectable({ providedIn: 'root' })
export class IsUserPremium  {
    constructor(
        private router: Router,
        private authService: AuthentificationApi,
    ) {}

    canActivate(): boolean {

        return true;
    }
}