import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { ToastrContent, ToastrService, ToastrType } from "../../Services/Toastr.service"
import { CommonModule } from "@angular/common";

@Component({
    selector: 'app-toastr',
    templateUrl: './Toastr.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false,
})
export class ToastrComponent implements OnInit {

    toastrs$: Observable<ToastrContent[] | null>;
    readonly ToastrType = ToastrType;
    toastrs: ToastrContent[] | null;

    constructor(private toastrService: ToastrService){}

    ngOnInit(): void {
        this.toastrs$ = this.toastrService.toastrContent$;
    }

    hide(content: ToastrContent){
        this.toastrService.hide(content);
    }
}