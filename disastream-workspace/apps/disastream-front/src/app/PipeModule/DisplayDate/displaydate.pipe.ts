import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'displaydate',
    standalone: false
})
export class DisplaydatePipe implements PipeTransform {

  transform(value: Date | null | undefined,isShort: boolean = false, prefix: boolean = false): unknown {

    if(value == null){
        return '';
    }

    var now = Date.now();
    var seconds = Math.floor((now - new Date(value).getTime()) / 1000);
    
    var interval = seconds / 31536000;
    var textDate = (prefix) ? "il y a " : "";

    if (interval > 1) {
        var textPeriod = (isShort) ? " a" : " an" + ((Math.floor(interval)) > 1 ? "s" : "");
        return textDate + Math.floor(interval) + textPeriod;
    }
    else{
        interval = seconds / 2592000;
        if (interval > 1) {
            var textPeriod = (isShort) ? " mois" : " mois";
            return textDate + Math.floor(interval) + textPeriod;
        }
        else{
            interval = seconds / 86400;
            if (interval > 1) {
                var textPeriod = (isShort) ? " j" : " jour"  + ((Math.floor(interval)) > 1 ? "s" : "");
                return textDate + Math.floor(interval) + textPeriod;
            }
            else{
                interval = seconds / 3600;
                if (interval > 1) {
                    var textPeriod = (isShort) ? " h" : " heure"  + ((Math.floor(interval)) > 1 ? "s" : "");
                    return textDate + Math.floor(interval) + textPeriod;
                }
                else{
                    interval = seconds / 60;
                    if (interval > 1) {
                        var textPeriod = (isShort) ? " min" : " minute"  + ((Math.floor(interval)) > 1 ? "s" : "");
                        return textDate + Math.floor(interval) + textPeriod;
                    }
                    else{
                        var textPeriod = (isShort) ? " s" : " seconde"  + ((Math.floor(interval)) > 1 ? "s" : "");
                        return textDate +  Math.floor(interval) + textPeriod;
                    }
                }
            }
        }
    }
  }

}
