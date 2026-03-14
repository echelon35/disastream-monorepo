import { Geometry } from 'geojson';
import { Alea } from '../Domain/alea.model';
import { AlertCriteria } from '../Domain/alert.model';
import { MailAlert } from '../Domain/mailAlert.model';

export class CreateAlertDto {
  areas: Geometry | null;
  name: string;
  aleas: Alea[];
  mailAlerts: MailAlert[];
  isCountryShape: boolean;
  countryId: number;
  criterias: AlertCriteria[];
  expirationDate: Date | null;
}
