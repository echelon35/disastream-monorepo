
import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthentificationApi } from 'src/app/Services/AuthentificationApi.service';
import { ToastrService } from 'src/app/Shared/Services/Toastr.service';
import { SharedModule } from 'src/app/Shared/Shared.module';
import { environment } from 'src/environments/environment';

@Component({
    templateUrl: './ConfirmAssociation.view.html',
    standalone: true,
    imports: [SharedModule]
})
export class ConfirmAssociationView {

  #env = environment;
  protected appName: string = this.#env.settings.appName;
  protected s3BasePath = this.#env.settings.s3_bucket;
  message = '';
  error = '';
  token = '';
  ma: number;
  masterUsername = '';
  loading = true;
  resendForm: FormGroup;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private readonly toastrService: ToastrService,
    private authentificationApi: AuthentificationApi) { 
      const token = this.route.snapshot.queryParamMap.get('token');
      this.token = (token !== null) ? token?.toString() : '';
      const masterUsername = this.route.snapshot.queryParamMap.get('master');
      this.ma = this.route.snapshot.queryParamMap.get('ma') != null ? parseInt(this.route.snapshot.queryParamMap.get('ma')!) : -1;
      this.masterUsername = masterUsername ? masterUsername.toString() : '';
      this.confirm(); 
    }

  confirm(): void {
    this.authentificationApi.confirmAssociation(this.token).subscribe({
      next: () => { 
        this.loading = false;
        this.message = `Votre adresse mail a bien été associée au compte de <b class='text-indigo-400'>${this.masterUsername}</b> ! <br> Celui-ci pourra désormais configurer des alertes pour vous.`},
      error: () => {
        this.loading = false;
        this.error = 'Lien de confirmation invalide ou expiré.' }
    });
  }

  goRegister(): void {
    this.router.navigateByUrl('/auth');
  }

  resend(): void {
    this.loading = true;
    this.authentificationApi.resendAssociation(this.ma).subscribe({
      next: (message: string) => {
        this.loading = false;
        // redirection ou message de succès
        this.router.navigateByUrl('/');
        this.toastrService.success('Invitation envoyée',`Un nouvel email d'association vient d'être envoyé.`);
      },
      error: (err) => {
        this.loading = false;
        const errorMessage = err.error.message || 'Erreur inconnue';
        this.toastrService.error(errorMessage);
      },
    });
  }

}