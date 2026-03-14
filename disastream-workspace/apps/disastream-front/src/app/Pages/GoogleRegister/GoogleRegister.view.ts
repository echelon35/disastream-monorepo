import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthentificationApi } from 'src/app/Services/AuthentificationApi.service';
import { SeoService } from 'src/app/Services/Seo.service';
import { Picture, RandomPictureService } from 'src/app/Shared/Services/RandomPicture.service';
import { environment } from 'src/environments/environment';

@Component({
    templateUrl: './GoogleRegister.view.html',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, CommonModule],
    providers: [AuthentificationApi, Router, SeoService, RandomPictureService, FormBuilder],
})
export class GoogleRegisterView implements OnInit {

    #env = environment;
    appName: string = this.#env.settings.appName;
    protected s3BasePath = this.#env.settings.s3_bucket;
    registerForm: FormGroup;
    errorMessage = '';
    picture: Picture;
    interimToken = '';

    #authentificationApi = inject(AuthentificationApi);
    #route = inject(Router);
    #activatedRoute = inject(ActivatedRoute);
    #seoService = inject(SeoService);
    #randomPictureService = inject(RandomPictureService);
    #fb = inject(FormBuilder);

    constructor() {
        this.picture = this.#randomPictureService.getPictureRandom();
        this.registerForm = this.#fb.group({
            username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
            rgpdConsent: [false, Validators.requiredTrue],
            allowMarketing: [false],
        });
    }

    ngOnInit() {
        this.#seoService.generateTags("Finaliser l'inscription Google", "Choisissez votre pseudo pour terminer la création de votre compte", `${this.s3BasePath}/background/avalanche.jpg`);
        this.interimToken = this.#activatedRoute.snapshot.queryParamMap.get('token') || '';
        if (!this.interimToken) {
            this.errorMessage = "Jeton de connexion Google expiré ou invalide. Veuillez réessayer.";
        }
    }

    onSubmit(): void {
        if (this.registerForm.invalid || !this.interimToken) return;

        const payload = {
            token: this.interimToken,
            username: this.registerForm.value.username,
            rgpdConsent: this.registerForm.value.rgpdConsent,
            allowMarketing: this.registerForm.value.allowMarketing
        };

        this.#authentificationApi.completeGoogleRegistration(payload).subscribe({
            next: (user: any) => {
                this.#route.navigateByUrl(`/?mail=${user.mail}`);
            },
            error: (err) => {
                this.errorMessage = err.error?.message || err.message || 'Erreur inconnue';
            },
        });
    }
}
