
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/Model/User';
import { AuthentificationApi } from 'src/app/Services/AuthentificationApi.service';
import { SeoService } from 'src/app/Services/Seo.service';
import { Picture, RandomPictureService } from 'src/app/Shared/Services/RandomPicture.service';
import { UserStore } from 'src/app/Store/user/user.store';
import { StrongPasswordRegx } from 'src/app/Utils/Const/StrongPasswordRegex';
import { environment } from 'src/environments/environment';

@Component({
    templateUrl: './Authentification.view.html',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, CommonModule],
    providers: [AuthentificationApi, Router, SeoService, RandomPictureService, FormBuilder, UserStore],
})
export class AuthenticationView {

  showLogin = true;
  #env = environment;
  appName: string = this.#env.settings.appName;
  protected s3BasePath = this.#env.settings.s3_bucket;
  registerForm: FormGroup;
  errorMessage = '';
  picture: Picture;

  #authentificationApi = inject(AuthentificationApi);
  #route = inject(Router);
  #seoService = inject(SeoService);
  #randomPictureService = inject(RandomPictureService);
  #fb = inject(FormBuilder);

  constructor() { 

    this.picture = this.#randomPictureService.getPictureRandom();

    this.#seoService.generateTags("S'authentifier sur Disastream","Inscrivez-vous sur Disastream pour être notifiés des dernières catastrophes naturelles",`${this.s3BasePath}/background/avalanche.jpg`);
    this.registerForm = this.#fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      mail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(StrongPasswordRegx)]],
      rgpdConsent: [false, Validators.requiredTrue],
      allowMarketing: [false],
    });
  }

  authenticate(): void {
    this.#authentificationApi.googleSignin();
  }

  get passwordFormField() {
    return this.registerForm.get('password');
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.#authentificationApi.register(this.registerForm.value).subscribe({
      next: (user: User) => {
        // redirection ou message de succès
        this.#route.navigateByUrl(`/?mail=${user.mail}`);
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'Erreur inconnue';
      },
    });
  }

}