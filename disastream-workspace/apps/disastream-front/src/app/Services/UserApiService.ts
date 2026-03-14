import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AuthentificationApi } from "./AuthentificationApi.service";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { User } from "../Model/User";

const env = environment;
const API_URL = `${env.settings.backend}`;

@Injectable({
  providedIn: 'root'
})
export class UserApiService {
    private httpOptions = {};

    constructor(private http: HttpClient, private authService: AuthentificationApi){
        this.httpOptions = {
            headers: new HttpHeaders({ 
              'Content-Type': 'application/json', 
              'Authorization': `Bearer ${this.authService.getToken()}`
            })
          };
    }

    getSummaryInfos(){
      this.httpOptions = {
        headers: new HttpHeaders({ 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${this.authService.getToken()}`
        })
      };
      return this.http.get<User>(API_URL + '/user/summary', this.httpOptions);
    }

    getMyProfile(){
      return this.http.get<User>(API_URL + '/profile', this.httpOptions);
    }

    isAdmin(){
      return this.http.get<{ isAdmin: boolean }>(API_URL + '/admin', this.httpOptions);
    }
}