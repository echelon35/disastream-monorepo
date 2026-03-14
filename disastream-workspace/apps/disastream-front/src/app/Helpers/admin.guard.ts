import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from '../Shared/Services/Toastr.service';
import { UserApiService } from '../Services/UserApiService';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class IsAdminGuard {
    readonly userService = inject(UserApiService);

    constructor(
        private router: Router,
        private toastrService: ToastrService
    ) { }

    canActivate(): Observable<boolean> {
        return this.userService.isAdmin().pipe(
            map((res: { isAdmin: boolean }) => {
                if (res.isAdmin) {
                    return true;
                }
                else{
                    this.toastrService.warning("Accès refusé", "Vous ne possédez pas les droits nécéssaires pour accéder à cette page");
                    this.router.navigate(['/dashboard']);
                    return false;
                }
            })
        );
    }
}
