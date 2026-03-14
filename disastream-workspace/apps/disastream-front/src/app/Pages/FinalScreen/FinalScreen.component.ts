import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
    templateUrl: './FinalScreen.component.html',
    standalone: false
})
export class FinalScreenView {
    public alertName = '';
    constructor(private route: ActivatedRoute, private router: Router){
        if(this.route.snapshot.queryParamMap.get('name') != null){
            this.alertName = this.route.snapshot.queryParamMap.get('name')!;
        }
    }

    goToAlerts(){
        this.router.navigateByUrl('/dashboard/alerts/manage');
    }
}