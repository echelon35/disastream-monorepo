
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthentificationApi } from 'src/app/Services/AuthentificationApi.service';
import { SeoService } from 'src/app/Services/Seo.service';
import { Picture, RandomPictureService } from 'src/app/Shared/Services/RandomPicture.service';
import { ToastrService } from 'src/app/Shared/Services/Toastr.service';
import { AuthStore } from 'src/app/Store/auth/auth.store';

@Component({
  templateUrl: './Login.view.html',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule]
})
export class LoginView {

  showLogin = true;
  loginForm: FormGroup;
  picture: Picture;

  isAuthenticated$: Observable<boolean>;

  #seoService = inject(SeoService);
  #authService = inject(AuthentificationApi);
  #randomPictureService = inject(RandomPictureService);
  #toastrService = inject(ToastrService);
  #router = inject(Router);
  #route = inject(ActivatedRoute);
  #fb = inject(FormBuilder);
  #authStore = inject(AuthStore);

  constructor() {

    this.picture = this.#randomPictureService.getPictureRandom();

    const error = this.#route.snapshot.queryParamMap.get('error');
    if (error) {
      this.#toastrService.error(error);
    }

    this.#seoService.generateTags("Se connecter sur Disastream", "Inscrivez-vous sur Disastream pour consulter les données de plusieurs milliers d'aléas en temps réél", "/assets/background/temperature.jpg");
    this.loginForm = this.#fb.group({
      password: ['', Validators.required],
      mail: ['', [Validators.required, Validators.email]],
    });
  }

  showLoginDiv(show: boolean) {
    this.showLogin = show;
  }

  connect() {
    this.#authStore.login(this.loginForm.value);
  }

  googleConnect(): void {
    const returnUrl = this.#route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
    localStorage.setItem('returnUrl', returnUrl);
    this.#authService.googleLogin();
  }

}