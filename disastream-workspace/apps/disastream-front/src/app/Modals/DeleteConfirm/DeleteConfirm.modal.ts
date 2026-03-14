import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output } from "@angular/core";
import { Alert } from "src/app/Model/Alert";
import { AlertApiService } from "src/app/Services/AlertApiService";
import { ToastrService } from "src/app/Shared/Services/Toastr.service";

@Component({
    selector: "app-delete-confirm",
    templateUrl: './DeleteConfirm.modal.html',
    standalone: true,
    imports: [CommonModule]
})
export class DeleteConfirmModal {

    isVisible = false;
    alert: Alert;
    @Output() alertDeleted = new EventEmitter();

    constructor(private readonly alertApiService: AlertApiService,
    private toastrService: ToastrService){}

    deleteAlert(){
        this.alertApiService.deleteAlert(this.alert.id).subscribe({
            next: () => {
                this.toastrService.success('Alerte supprimée',`L'alerte <b>${this.alert.name}</b> a bien été supprimée`);
                this.alertDeleted.emit();
                this.close();
            },
            error: () => this.toastrService.error(`Erreur`,`Une erreur est survenue lors de la suppression de l'alerte`),
        })
    }

    close(){
        this.isVisible = false;
    }

    open() {
        this.isVisible = true;
    }


}
