import { Geometry } from "geojson";
import { Alea } from "./Alea";
import { MailAlert } from "./MailAlert";
import { AlertCriterion } from "./AlertCriterion";

export class Alert {
    id: number;
    name = "";
    aleas: Alea[] = [];
    areas?: Geometry | null;
    mailAlerts: MailAlert[] = [];
    isCountryShape = false;
    createdAt: Date;
    updatedAt: Date;
    expirationDate?: Date;
    countryId: number | null;
    criterias: AlertCriterion[] = [];
    isActivate: boolean;
}