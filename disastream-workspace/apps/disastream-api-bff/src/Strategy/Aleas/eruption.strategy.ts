import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Disaster, Eruption } from '@disastream/models';
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
export class EruptionStrategy implements IDisasterStrategy {
    readonly type = 'eruption';
    readonly tableName = 'eruptions';
    readonly extraGeoJSONFields: string[] = ['surface'];
    readonly extraSelectFields: string[] = [];

    constructor(
        @InjectRepository(Eruption, 'DisasterDb')
        private readonly repository: Repository<Eruption>,
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

        templateData.background = 'https://disastream-bucket.s3.fr-par.scw.cloud/background/eruption.jpg';
        templateData.title = 'Eruption volcanique détectée';
        templateData.subtitle = `Votre alerte ${alert.name} ${titleTypeUpdate} une éruption volcanique`;
        templateData.disasterDate = `L'éruption a commencé ${DateToAgo(disaster?.premier_releve, false, true)} (${disaster?.premier_releve}) selon ${disaster?.source?.name} mais fut enregistrée ${DateToAgo(disaster?.premier_releve, false, false, disaster?.createdAt)} après.`;
        templateData.disasterLocation = `L'éruption est située à ${Math.ceil(nearestCity.distance)}km de ${nearestCity.city} (${nearestCity.country})`;
        templateData.disasterSource = `L'éruption a été detectée par l'observatoire ${disaster?.source?.name}.`;
        templateData.imageDate = 'https://disastream-bucket.s3.fr-par.scw.cloud/mail_templates/sismographe.png';

        let subjectMail = process.env.ENVIRONMENT === 'qual' ? '[QUAL]' : '';
        subjectMail += `Votre alerte ${alert.name} ${titleTypeUpdate} une éruption volcanique !`;

        return {
            templateData,
            subjectMail,
        };
    }

    getSortValue(disaster: any): number {
        return 0;
    }
}
