import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input } from "@angular/core";
import { Alert } from "src/app/Model/Alert";
import { AlertApiService } from "src/app/Services/AlertApiService";
import { ToastrService } from "src/app/Shared/Services/Toastr.service";
import { SharedModule } from "src/app/Shared/Shared.module";

@Component({
    selector: "app-end-alert-modal",
    templateUrl: './EndAlert.modal.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [SharedModule, CommonModule]
})
export class EndAlertComponent {

    isVisible = false;
    loading = true;
    @Input() alert: Alert;
    @Input() editMode = false;
    private cd = inject(ChangeDetectorRef)

    constructor(private readonly alertApiService: AlertApiService,
        private readonly toastrService: ToastrService
    ){}

    open() {
        this.isVisible = true;
    }

    createAlert(){
        if(this.alert.name != '' && this.alert.aleas.length > 0 && this.alert.mailAlerts.length > 0){
            if(this.editMode){
                this.alertApiService.editAlert(this.alert).subscribe(
                    (alert: Alert) => {
                        console.log('succès');
                        console.log(alert);
                        this.alert = alert;
                    },
                    (e) => {
                        console.log(e);
                        this.toastrService.error('Erreur','Une erreur est survenue lors de l\'édition de votre alerte');
                        this.close();
                    },
                    () => {
                        this.loading = false;
                        this.updateComponent()
                    }
                )
            }
            else{
                this.alertApiService.createAlert(this.alert).subscribe(
                    (alert: Alert) => {
                        console.log('succès');
                        console.log(alert);
                        this.alert = alert;
                    },
                    (e) => {
                        console.log(e);
                        this.toastrService.error('Erreur','Une erreur est survenue lors de la création de votre alerte');
                        this.close();
                    },
                    () => {
                        this.loading = false;
                        this.updateComponent()
                    }
                )
            }
        }
    }
    
    close() {
        this.isVisible = false;
    }

    /**
     * Update view
     */
    updateComponent(){
        this.cd.markForCheck();
    }
}