export class TemplateExpiredAlertData {
  title: string = '';
  subtitle: string = '';
  linkSource: string = ''; // URL linked to button
  subjectMail: string = '';
  modifyAlert: string = '';
  myAlerts: string = '';
}

export class ExpiredAlertMailContent {
  templateData: TemplateExpiredAlertData;
  subjectMail: string;
}
