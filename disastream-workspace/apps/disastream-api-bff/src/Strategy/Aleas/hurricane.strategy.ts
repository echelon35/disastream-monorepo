import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Disaster, Hurricane } from '@disastream/models';
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
export class HurricaneStrategy implements IDisasterStrategy {
    readonly type = 'hurricane';
    readonly tableName = 'hurricanes';
    readonly extraGeoJSONFields: string[] = ['surface', 'path', 'forecast'];
    readonly extraSelectFields: string[] = [];

    constructor(
        @InjectRepository(Hurricane, 'DisasterDb')
        private readonly repository: Repository<Hurricane>,
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
        const templateData = new AlertTemplateData();
        const myAlerts = `${process.env.DISASTREAM_FRONT_BASE_URI}/dashboard/alerts/manage`;
        const modifyAlerts = `${process.env.DISASTREAM_FRONT_BASE_URI}/dashboard/alert/edit?id=${alert.id}`;
        const titleTypeUpdate = disasterData.type == InsertType.CREATION ? 'a detecté' : 'a mis à jour';

        templateData.myAlerts = `${myAlerts}`;
        templateData.modifyAlerts = `${modifyAlerts}`;
        templateData.disasterImpactValue = disaster?.nb_ressenti.toString();
        templateData.linkSource = disaster?.lien_source;
        templateData.disasterDetail = `${process.env.DISASTREAM_FRONT_BASE_URI}/dashboard/${disasterData.disaster_type}/${disasterData.disaster.id}`;

        templateData.background = 'https://disastream-bucket.s3.fr-par.scw.cloud/background/hurricane.jpg';
        templateData.title = 'Cyclone détecté';
        templateData.subtitle = `Votre alerte ${alert.name} ${titleTypeUpdate} un cyclone`;
        templateData.disasterDate = `Le cyclone existe depuis ${DateToAgo(disaster?.premier_releve, false, false)} (${disaster?.premier_releve}) selon ${disaster?.source?.name} mais fut enregistré ${DateToAgo(disaster?.premier_releve, false, false, disaster?.createdAt)} après.`;
        templateData.imageDate = 'https://disastream-bucket.s3.fr-par.scw.cloud/mail_templates/manche-a-air.png';
        templateData.disasterLocation = `Le cyclone est actuellement situé à ${Math.ceil(nearestCity.distance)}km de ${nearestCity.city} (${nearestCity.country})`;
        templateData.disasterSource = `Le cyclone a été detecté par l'observatoire ${disaster?.source?.name}.`;

        let subjectMail = process.env.ENVIRONMENT === 'qual' ? '[QUAL]' : '';
        subjectMail += `Votre alerte ${alert.name} ${titleTypeUpdate} un cyclone !`;

        return {
            templateData,
            subjectMail,
        };
    }

    getSortValue(disaster: any): number {
        return 0;
    }
}
