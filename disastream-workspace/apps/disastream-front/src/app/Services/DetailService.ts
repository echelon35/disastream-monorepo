import { Injectable } from "@angular/core";
import { Disaster } from "../Model/Disaster";
import { BehaviorSubject } from "rxjs";
import { DisasterApiService } from "./DisasterApiService";

export class DisasterDetail {
  disaster: Disaster;
  title: string;
  localisation
}

@Injectable({
    providedIn: 'root'
})
export class DetailService {
    private disasterDetailSubject = new BehaviorSubject<Disaster>(new Disaster);
    disasterDetail$ = this.disasterDetailSubject.asObservable();
    private disasterTitleSubject = new BehaviorSubject<string>('');
    disasterTitle$ = this.disasterTitleSubject.asObservable();
    private visibleSubject = new BehaviorSubject<boolean>(false);
    visible$ = this.visibleSubject.asObservable();

  constructor(private readonly disasterApiService: DisasterApiService){
  }

  /**
   * Définit la catastrophe dont on souhaite afficher les détails.
   * @param disaster Informations sur la catastrophe
   */
  setDisasterDetail(disaster: Disaster) {
    this.disasterDetailSubject?.next(disaster);
    // switch(disaster.type){
    //   case 'flood':

    //   this.disasterApiService
    //   .searchFloodById(disaster.id)
    //   .pipe(
    //     tap(() => {
    //       // Le succès est traité ici
    //       console.log("Requête réussie.");
    //     }),
    //     catchError((error) => {
    //       // Gestion des erreurs
    //       console.error("Erreur lors de la requête :", error);
    //       return of(null); // Retourne un observable vide pour continuer
    //     }),
    //     finalize(() => {
    //       // Cela sera toujours exécuté, même en cas d'erreur
    //       console.log("Finalisation");
    //     })
    //   )
    //   .subscribe(gql => {
    //     console.log(gql);
    //     if(!gql) return;
    //     const fls = gql.data?.flood;
    //     this.disasterDetailSubject?.next(fls);        
    //   })
    //   break;

    //   case 'earthquake': 

    //   this.disasterApiService
    //   .searchEarthquakeById(disaster.id)
    //   .pipe(
    //     tap(() => {
    //       // Le succès est traité ici
    //       console.log("Requête réussie.");
    //     }),
    //     catchError((error) => {
    //       // Gestion des erreurs
    //       console.error("Erreur lors de la requête :", error);
    //       return of(null); // Retourne un observable vide pour continuer
    //     }),
    //     finalize(() => {
    //       // Cela sera toujours exécuté, même en cas d'erreur
    //       console.log("Finalisation");
    //     })
    //   )
    //   .subscribe(gql => {
    //     if(!gql) return;
    //     const fls = gql.data?.earthquake;
    //     this.disasterDetailSubject?.next(fls);        
    //   })
    //   break;

    //   case 'eruption': 

    //   this.disasterApiService
    //   .searchEruptionById(disaster.id)
    //   .pipe(
    //     tap(() => {
    //       // Le succès est traité ici
    //       console.log("Requête réussie.");
    //     }),
    //     catchError((error) => {
    //       // Gestion des erreurs
    //       console.error("Erreur lors de la requête :", error);
    //       return of(null); // Retourne un observable vide pour continuer
    //     }),
    //     finalize(() => {
    //       // Cela sera toujours exécuté, même en cas d'erreur
    //       console.log("Finalisation");
    //     })
    //   )
    //   .subscribe(gql => {
    //     if(!gql) return;
    //     const vo = gql.data?.eruption;
    //     this.disasterDetailSubject?.next(vo);        
    //   })
    //   break;

    //   case 'hurricane': 

    //   this.disasterApiService
    //   .searchHurricaneById(disaster.id)
    //   .pipe(
    //     tap(() => {
    //       // Le succès est traité ici
    //       console.log("Requête réussie.");
    //     }),
    //     catchError((error) => {
    //       // Gestion des erreurs
    //       console.error("Erreur lors de la requête :", error);
    //       return of(null); // Retourne un observable vide pour continuer
    //     }),
    //     finalize(() => {
    //       // Cela sera toujours exécuté, même en cas d'erreur
    //       console.log("Finalisation");
    //     })
    //   )
    //   .subscribe(gql => {
    //     if(!gql) return;
    //     const hu = gql.data?.hurricane;
    //     this.disasterDetailSubject?.next(hu);        
    //   })
    //   break;

    // }
  }

  setDisasterTitle(title: string){
    this.disasterTitleSubject?.next(title);
  }

  show(){
    this.visibleSubject.next(true);
  }

  hide(){
    this.visibleSubject.next(false);
  }

  
}