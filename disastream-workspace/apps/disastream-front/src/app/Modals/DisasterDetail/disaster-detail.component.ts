import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import L from "leaflet";
import { DetailService } from "src/app/Services/DetailService";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { Disaster } from "src/app/Model/Disaster";

@Component({
    selector: "app-disaster-detail",
    templateUrl: './disaster-detail.component.html',
    styleUrls: ['./disaster-detail.component.css'],
    standalone: true,
    imports: [CommonModule]
})
export class DisasterDetailComponent {
    detailService = inject(DetailService);
    disaster$ = this.detailService.disasterDetail$;
    visible$ = this.detailService.visible$;
    title$ = this.detailService.disasterTitle$;
    detailMap: L.Map;
    detailLayer: L.LayerGroup;
    mapReceived = false;

    constructor(private router: Router) {

    }

    close() {
        this.detailService.hide();
    }

    navigateToMap(disaster: Disaster) {
        this.close();
        this.router.navigate(['/dashboard', disaster.type, disaster.id], { state: { fromDisasterView: true } });
    }

}