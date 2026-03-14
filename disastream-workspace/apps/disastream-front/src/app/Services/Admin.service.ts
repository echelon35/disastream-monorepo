import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthentificationApi } from './AuthentificationApi.service';
import { Country } from '../Model/Country';

export interface CityAdmin {
  id: number;
  namefr: string;
  population: number;
  altitude: number;
  timezone: string;
  paysId: number;
  geom: string; // ST_AsGeoJSON
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.settings.backend + '/admin/cities';
  private httpOptions = {};
  #authService = inject(AuthentificationApi);

  constructor() {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.#authService.getToken()}`
      })
    };
  }

  getCitiesByCountry(countryId: number, outOfGeometry: boolean, page: number = 1, limit: number = 50): Observable<{ data: CityAdmin[], total: number }> {
    return this.http.get<{ data: CityAdmin[], total: number }>(`${this.apiUrl}/${countryId}?outOfGeometry=${outOfGeometry}&page=${page}&limit=${limit}`, this.httpOptions);
  }

  getCitiesCount(countryId: number): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(`${this.apiUrl}/${countryId}/count`, this.httpOptions);
  }

  updateCity(id: number, data: Partial<CityAdmin>): Observable<CityAdmin> {
    return this.http.put<CityAdmin>(`${this.apiUrl}/${id}`, data, this.httpOptions);
  }

  updateMultipleCities(cityIds: number[], data: Partial<CityAdmin>): Observable<{ affected: number }> {
    return this.http.patch<{ affected: number }>(this.apiUrl, { cityIds, ...data }, this.httpOptions);
  }

  getCountry(id: number): Observable<Country> {
    return this.http.get<Country>(`${environment.settings.backend}/admin/country/${id}`, this.httpOptions);
  }

  updateCountry(id: number, data: any): Observable<Country> {
    return this.http.put<Country>(`${environment.settings.backend}/admin/country/${id}`, data, this.httpOptions);
  }
}