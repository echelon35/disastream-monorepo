import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Disaster, Earthquake } from '@disastream/models';
import { Repository } from 'typeorm';
import { IDisasterStrategy } from './IDisasterStrategy';
import { DisasterDataFromSQS, InsertType } from '../../DTO/disasterDataFromSQS';
import { Alert } from '../../Domain/alert.model';
import { CityDistanceDto } from '../../DTO/cityDistance.dto';
import {
    AlertMailContent,
    AlertTemplateData,
} from '../../DTO/TemplatesDto/templateAlertDto';
import { DateToAgo } from '../../Common/Utils/DateUtils';

@Injectable()
export class EarthquakeStrategy implements IDisasterStrategy {
    readonly type = 'earthquake';
    readonly tableName = 'earthquakes';
    readonly extraGeoJSONFields: string[] = [];
    readonly extraSelectFields: string[] = ['magnitude'];

    constructor(
        @InjectRepository(Earthquake, 'DisasterDb')
        private readonly repository: Repository<Earthquake>,
    ) { }

    getRepository(): Repository<any> {
        return this.repository;
    }

    buildMailContent(
        disaster: Disaster,
        disasterData: DisasterDataFromSQS,
        alert: Alert,
        nearestCity: CityDistanceDto,
    ): AlertMailContent {
        const earthquake = disaster as Earthquake;
        const templateData = new AlertTemplateData();
        const myAlerts = `${process.env.DISASTREAM_FRONT_BASE_URI}/dashboard/alerts/manage`;
        const modifyAlerts = `${process.env.DISASTREAM_FRONT_BASE_URI}/dashboard/alert/edit?id=${alert.id}`;
        const titleTypeUpdate = disasterData.type == InsertType.CREATION ? 'a detecté' : 'a mis à jour';

        templateData.myAlerts = `${myAlerts}`;
        templateData.modifyAlerts = `${modifyAlerts}`;
        templateData.disasterImpactValue = disaster?.nb_ressenti.toString();
        templateData.linkSource = disaster?.lien_source;
        templateData.disasterDetail = `${process.env.DISASTREAM_FRONT_BASE_URI}/dashboard/${disasterData.disaster_type}/${disasterData.disaster.id}`;

        templateData.background = 'https://disastream-bucket.s3.fr-par.scw.cloud/background/earthquake.jpg';
        templateData.title = 'Séisme detecté';
        templateData.subtitle = `Votre alerte ${alert.name} ${titleTypeUpdate} un séisme`;
        templateData.disasterDate = `Le séisme a eu lieu ${DateToAgo(disaster?.premier_releve, false, true)} (${disaster?.premier_releve}) selon ${disaster?.source?.name} mais fut enregistré ${DateToAgo(disaster?.premier_releve, false, false, disaster?.createdAt)} après.`;
        templateData.disasterLocation = `L'épicentre est localisé à ${Math.ceil(nearestCity.distance)}km de ${nearestCity.city} (${nearestCity.country})`;
        templateData.disasterSource = `Le séisme a été detecté par l'observatoire ${disaster?.source?.name}.`;
        templateData.powerDisplayed = 'true';
        templateData.disasterPower = 'Magnitude';
        templateData.disasterPowerValue = earthquake.magnitude?.toString();
        templateData.imageDate = 'https://disastream-bucket.s3.fr-par.scw.cloud/mail_templates/sismographe.png';

        let subjectMail = process.env.ENVIRONMENT === 'qual' ? '[QUAL]' : '';
        subjectMail += `Votre alerte ${alert.name} ${titleTypeUpdate} un séisme !`;

        return {
            templateData,
            subjectMail,
        };
    }

    getSortValue(disaster: any): number {
        const eq = disaster as Earthquake;
        return eq.magnitude;
    }
}
