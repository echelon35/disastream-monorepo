import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { AleaCategoryDto } from "../DTO/AleaCategory.dto";
import { Observable } from "rxjs";

const env = environment;
const API_URL = `${env.settings.backend}`;

class InterestedUserDto {
  comment: string;
  mail: string;
}

@Injectable({
  providedIn: 'root'
})
export class PublicApiService {
  private httpOptions = {};

  constructor(private http: HttpClient) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };
  }

  getAleasByCategory(): Observable<AleaCategoryDto[]> {
    return this.http.get<AleaCategoryDto[]>(API_URL + '/aleas', { responseType: 'json' });
  }

  getCriterias(): Observable<any[]> {
    return this.http.get<any[]>(API_URL + '/aleas/criterias', { responseType: 'json' });
  }

  interestedPro(interestedUserDto: InterestedUserDto) {
    return this.http.post(API_URL + '/user/pro/interested', interestedUserDto, { responseType: 'json' })
  }
}