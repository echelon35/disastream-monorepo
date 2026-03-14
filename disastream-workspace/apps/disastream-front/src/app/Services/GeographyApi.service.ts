import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Earthquake } from "../Model/Earthquake";
import { Observable } from "rxjs";
import { Country } from "../Model/Country";

const env = environment;
const API_URL = `${env.settings.backend}`;

@Injectable({
    providedIn: 'root'
})
export class GeographyApiService {
    private httpOptions = {};

    constructor(private http: HttpClient){
        this.httpOptions = {
            headers: new HttpHeaders({ 
              'Content-Type': 'application/json', 
            })
          };
    }

    getCountries(): Observable<Country[]> {
        return this.http.get<Country[]>(API_URL + '/country', this.httpOptions)
    }

    getCountryById(countryId: number): Observable<Country> {
        return this.http.get<Country>(API_URL + '/country/' + countryId, this.httpOptions)
    }
}