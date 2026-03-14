export class AlertTemplateData {
  background: string = '';
  title: string = '';
  subtitle: string = '';
  linkSource: string = '';
  disasterDate: string = '';
  disasterLocation: string = '';
  disasterSource: string = '';
  disasterImpactValue: string = '';
  disasterPower: string = '';
  disasterPowerValue: string = '';
  disasterDetail: string = '';
  imageDate: string = '';
  powerDisplayed: string = 'false';
  myAlerts: string = '';
  modifyAlerts: string = '';
}

export class AlertMailContent {
  templateData: AlertTemplateData;
  subjectMail: string;
}
