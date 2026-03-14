
import { Component, Input, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-footer',
    templateUrl: './Footer.component.html',
    styleUrls: ['./Footer.component.css'],
    standalone: false
})
export class Footer implements OnInit {

    env = environment;
    appName: string = this.env.settings.appName;

    constructor() { 
    }

    ngOnInit(): void {
    }

}