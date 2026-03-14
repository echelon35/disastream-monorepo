import { Injectable } from '@nestjs/common';
import { GdacsService } from './gdacs.service';
import { IDisasterProvider } from './Interfaces/IDisasterProvider';
import { Earthquake, Eruption, Flood, Hurricane } from '@disastream/models';
import { Observable } from 'rxjs';

@Injectable()
export class GdacsEarthquakeProvider implements IDisasterProvider<Earthquake> {
    sourceName = 'GDACS';
    constructor(private readonly gdacsService: GdacsService) { }
    fetchData(): Observable<Earthquake[]> {
        return this.gdacsService.getEarthquakeData();
    }
}

@Injectable()
export class GdacsFloodProvider implements IDisasterProvider<Flood> {
    sourceName = 'GDACS';
    constructor(private readonly gdacsService: GdacsService) { }
    fetchData(): Observable<Flood[]> {
        return this.gdacsService.getFloodData();
    }
}

@Injectable()
export class GdacsEruptionProvider implements IDisasterProvider<Eruption> {
    sourceName = 'GDACS';
    constructor(private readonly gdacsService: GdacsService) { }
    fetchData(): Observable<Eruption[]> {
        return this.gdacsService.getEruptionData();
    }
}

@Injectable()
export class GdacsHurricaneProvider implements IDisasterProvider<Hurricane> {
    sourceName = 'GDACS';
    constructor(private readonly gdacsService: GdacsService) { }
    fetchData(): Observable<Hurricane[]> {
        return this.gdacsService.getHurricaneData();
    }
}
