import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-admin-view',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './Admin.view.html',
})
export class AdminView {
}
