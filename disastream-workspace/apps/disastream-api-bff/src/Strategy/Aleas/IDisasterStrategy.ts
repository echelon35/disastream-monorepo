import { Disaster } from '@disastream/models';
import { Repository } from 'typeorm';
import { DisasterDataFromSQS } from '../../DTO/disasterDataFromSQS';
import { Alert } from '../../Domain/alert.model';
import { CityDistanceDto } from '../../DTO/cityDistance.dto';
import { AlertMailContent } from '../../DTO/TemplatesDto/templateAlertDto';

export interface IDisasterStrategy {
    /** The alea name ('earthquake') */
    readonly type: string;

    /** The database table name ('earthquakes') */
    readonly tableName: string;

    /** Extra GeoJSON fields to select if any (['surface', 'path', 'forecast']) */
    readonly extraGeoJSONFields: string[];

    /** Extra normal fields to select if any (e.g. ['magnitude']) */
    readonly extraSelectFields: string[];

    /** Returns the TypeORM repository for this alea */
    getRepository(): Repository<any>;

    /** Builds the specific email content and template data for this alea */
    buildMailContent(
        disaster: Disaster,
        disasterData: DisasterDataFromSQS,
        alert: Alert,
        nearestCity: CityDistanceDto,
    ): AlertMailContent;

    /** Optional sort value logic (default implementation typically return nothing if not needed) */
    getSortValue(disaster: any): number;
}
