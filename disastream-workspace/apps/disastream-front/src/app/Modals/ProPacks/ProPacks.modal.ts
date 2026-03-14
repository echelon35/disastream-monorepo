
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { PublicApiService } from 'src/app/Services/PublicApi.service';
import { ToastrService } from 'src/app/Shared/Services/Toastr.service';
import { SharedModule } from 'src/app/Shared/Shared.module';
import { environment } from 'src/environments/environment';

@Component({
    selector: "app-pro-pack-modal",
    templateUrl: './ProPacks.modal.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ReactiveFormsModule, SharedModule, CommonModule]
})
export class ProPacksComponent {

    env = environment;
    appName: string = this.env.settings.appName;
    sendMailForm: FormGroup;

    //Change detector to update component manually
    private cd = inject(ChangeDetectorRef)

    isVisible = false;
    messageToDisplay = '';
    loading = false;
    submit = false;

    constructor(private readonly publicApiService: PublicApiService,
      private fb: FormBuilder,
      private toastrService: ToastrService
    ){
      this.sendMailForm = this.fb.group({
        mail: ['', [Validators.required, Validators.email]],
        comment: ['', [Validators.maxLength(500)]],
      });

      this.sendMailForm.patchValue({comment: `Bonjour, je suis intéressé par votre Pack Pro, pourrais-je avoir davantage d'informations ? Merci d'avance.` })
    }

    get mailFormField() {
      return this.sendMailForm.get('mail');
    }

    sendMail(){
      this.submit = true;
      if (this.sendMailForm.invalid) return;
      const mail = this.sendMailForm.get('mail')?.value;

      if(mail != ''){
        this.loading = true;
        const comment = this.sendMailForm.get('comment')?.value;
        const interestedUserDto = {
          comment: `${comment}`,
          mail: mail
        }
        this.publicApiService.interestedPro(interestedUserDto).pipe(
          finalize(() => {
            console.log("finalize")
            this.loading = false; 
            this.close();
          })
        ).subscribe({
          next: (message) => {
            this.toastrService.success('Mail envoyé',`Merci de nous avoir contacté, nous reviendrons très vite vers vous.`)
          },
          error: (err) => {
            this.toastrService.error('Erreur',`Une erreur est survenue lors de l'envoi.`)
            this.messageToDisplay = err.error.error;
          },
        });
      }

    }

    open() {
      this.isVisible = true;
      this.messageToDisplay = '';
      this.updateComponent();
    }

    /**
     * Update view
     */
    updateComponent(){
      this.cd.markForCheck();
    }
  
    close() {
      this.isVisible = false;
      this.updateComponent();
    }

}