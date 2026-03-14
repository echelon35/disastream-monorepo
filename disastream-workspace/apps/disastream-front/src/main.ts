import { environment } from './environments/environment';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app.component';
import { appConfig } from './app/app.config';

if(environment.production){
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    window.console.log = () => { }
}
bootstrapApplication(App, appConfig).catch((err) => console.error(err));