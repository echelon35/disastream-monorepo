import { Component, OnInit } from '@angular/core';
import { SeoService } from 'src/app/Services/Seo.service';

@Component({
  selector: 'app-verifyaccount-view',
  templateUrl: './VerifyAccount.view.html',
  styleUrls: ['./VerifyAccount.view.css']
})
export class VerifyAccountView implements OnInit {

  showLogin = true;

  constructor(private seoService: SeoService) { 
    this.seoService.generateTags("S'authentifier sur SatellEarth","Inscrivez-vous sur SatellEarth pour consulter les données de plusieurs milliers d'aléas en temps réél","/assets/background/temperature.jpg");
  }

  ngOnInit(): void {
  }

  showLoginDiv(show:boolean){
    this.showLogin = show;
  }

}