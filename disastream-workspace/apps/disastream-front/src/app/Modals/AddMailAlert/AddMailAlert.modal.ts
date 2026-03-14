
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MailAlert } from 'src/app/Model/MailAlert';
import { AlertApiService } from 'src/app/Services/AlertApiService';
import { ToastrService } from 'src/app/Shared/Services/Toastr.service';
import { SharedModule } from 'src/app/Shared/Shared.module';
import { environment } from 'src/environments/environment';

@Component({
    selector: "app-mail-alert-modal",
    templateUrl: './AddMailAlert.modal.html',
    standalone: true,
    imports: [SharedModule, CommonModule, ReactiveFormsModule],
})
export class AddMailAlert {

    env = environment;
    appName: string = this.env.settings.appName;
    mailToAdd: MailAlert = new MailAlert();
    @Output() createdMail = new EventEmitter();
    inviteUserForm: FormGroup;

    isVisible = false;
    messageToDisplay = '';
    loading = false;

    constructor(private readonly alertApiService: AlertApiService,
      private fb: FormBuilder,
      private toastrService: ToastrService
    ){
      this.inviteUserForm = this.fb.group({
        mail: ['', [Validators.required, Validators.email]],
      });
    }

    addMail(){
      this.loading = true;
      const mail = this.inviteUserForm.get('mail')?.value;
      if(mail != ''){
        this.alertApiService.addMailAlert(mail).subscribe((message) => {
          this.toastrService.success('Invitation envoyée',`Une invitation à rejoindre votre équipe a été envoyée à <b>${mail}</b>`)
          this.createdMail.emit();
          this.inviteUserForm.reset();
          this.close();

        },(err) => {
          console.log(err)
          this.toastrService.error('Erreur',`Une erreur est survenue lors de l'envoi de l'email d'invitation.`)
          this.messageToDisplay = err.error.error;
        }, () => {
          this.loading = false;
        });
      }
    }

    open() {
      this.isVisible = true;
      //Reset before open
      this.mailToAdd = new MailAlert();
      this.messageToDisplay = '';
    }
  
    close() {
      this.isVisible = false;
    }

}