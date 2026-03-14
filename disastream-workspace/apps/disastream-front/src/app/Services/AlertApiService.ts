import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { AuthentificationApi } from "./AuthentificationApi.service";
import { Alert } from "../Model/Alert";
import { Observable } from "rxjs";
import { MailAlert } from "../Model/MailAlert";
import { StatisticsOnPeriodDTO } from "../DTO/StatisticsOnPeriod.dto";
import { DisasterAlertDto } from "../DTO/DisasterAlertDto";

const env = environment;
const API_URL = `${env.settings.backend}`;

@Injectable({
  providedIn: 'root'
})
export class AlertApiService {
    private httpOptions = {};

    constructor(private http: HttpClient, private authService: AuthentificationApi){
        this.httpOptions = {
            headers: new HttpHeaders({ 
              'Content-Type': 'application/json', 
              'Authorization': `Bearer ${this.authService.getToken()}`
            })
          };
    }

    createAlert(alert: Alert){
      return this.http.post<Alert>(API_URL + '/alert/create', alert, this.httpOptions);
    }

    editAlert(alert: Alert){
      return this.http.put<Alert>(API_URL + '/alert/edit', alert, this.httpOptions);
    }

    getUserAlerts(): Observable<Alert[]> {
      return this.http.get<Alert[]>(API_URL + '/alert', this.httpOptions)
    }

    getDisastersAlerts(id: number, page = 1, filter = 'premier_releve', order = 'ASC', country = '', city = '', premier_releve = '', dernier_releve = '', strict = false): Observable<DisasterAlertDto> {
      return this.http.get<DisasterAlertDto>(API_URL + `/alert/disasters/${id}?page=${page}&order=${order}&filter=${filter}&city=${city}&country=${country}&premier_releve=${premier_releve}&dernier_releve=${dernier_releve}&strict=${strict}`, this.httpOptions)
    }

    getAlertById(id: number): Observable<Alert> {
      return this.http.get<Alert>(API_URL + '/alert/' + id, this.httpOptions)
    }

    getLastWeekStatistics(): Observable<StatisticsOnPeriodDTO[]> {
      return this.http.get<StatisticsOnPeriodDTO[]>(API_URL + '/history/last-week', this.httpOptions)
    }

    getMailAlerts(): Observable<MailAlert[]> {
      return this.http.get<MailAlert[]>(API_URL + '/alert/mails', this.httpOptions);
    }

    addMailAlert(mailToAdd: string): Observable<string> {
      const mailAlert = {
        mail: mailToAdd,
      }
      return this.http.post<string>(API_URL + '/alert/mail/create', mailAlert, this.httpOptions);
    }

    deleteAlert(alertId: number){
      return this.http.delete<string>(API_URL + '/alert/delete/' + alertId, this.httpOptions);
    }

    activateAlert(alertId: number, activation: boolean){
      return this.http.put<string>(API_URL + '/alert/activate/' + alertId + '?isActivate=' + activation, {}, this.httpOptions);
    }
}