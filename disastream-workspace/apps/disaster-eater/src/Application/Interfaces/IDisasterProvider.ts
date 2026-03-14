import { Disaster } from '@disastream/models';
import { Observable } from 'rxjs';

export interface IDisasterProvider<T extends Disaster> {
    sourceName: string;
    fetchData(): Observable<T[]> | Promise<T[]>;
}
