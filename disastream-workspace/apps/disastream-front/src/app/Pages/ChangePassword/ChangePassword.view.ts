import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthentificationApi } from 'src/app/Services/AuthentificationApi.service';
import { ToastrService } from 'src/app/Shared/Services/Toastr.service';
import { StrongPasswordRegx } from 'src/app/Utils/Const/StrongPasswordRegex';
import { environment } from 'src/environments/environment.prod';

@Component({
    templateUrl: './ChangePassword.view.html',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, CommonModule]
})
export class ChangePasswordView implements OnInit {

  #env = environment;
  protected s3BasePath = this.#env.settings.s3_bucket;
  passwordForm: FormGroup;
  loading = false;
  submitted = false;
  token = '';
  errors = '';
  message = '';
  
  constructor(protected authApiService: AuthentificationApi,
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
    private route: ActivatedRoute) { 
      const token = this.route.snapshot.queryParamMap.get('token');
      this.token = (token !== null) ? token?.toString() : '';
  }

  get passwordFormField() {
    return this.passwordForm.get('password');
  }

  get confirmPasswordFormField() {
    return this.passwordForm.get('confirm_password');
  }

  ngOnInit(): void {
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.pattern(StrongPasswordRegx)]],
      confirm_password: ['', [Validators.required]]
    });
  }

  goLogin(): void {
    this.router.navigateByUrl('/login');
  }

  onSubmit(): void{

    this.errors = '';

    //En cas de formulaire invalide, on va pas plus loin
    if (this.passwordForm.invalid) {
      return;
    }

    if(this.passwordFormField?.value !== this.confirmPasswordFormField?.value){
      this.errors = 'La confirmation doit-être identique au mot de passe.'
      return;
    }

    const changePasswordDto = {
      password: this.passwordFormField?.value,
      token: this.token,
    }

    this.authApiService.changePassword(changePasswordDto).subscribe({
      next: () => {
        this.message = `Mot de passe réinitialisé avec succès !`;
      },
      error: () => {
        this.toastrService.error(`Erreur lors de la réinitialisation du mot de passe`, 'Veuillez renvoyer un lien de réinitialisation via <b>Mot de passe oublié</b> dans le login')
      },
    });

  }

}
