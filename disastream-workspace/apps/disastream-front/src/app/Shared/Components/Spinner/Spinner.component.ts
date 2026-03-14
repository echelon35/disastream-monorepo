import { Component, Input } from "@angular/core";

@Component({
    selector: 'app-spinner',
    templateUrl: './Spinner.component.html',
    standalone: false,
})
export class SpinnerComponent {
    @Input() dark = true;
    @Input() width = "";
}