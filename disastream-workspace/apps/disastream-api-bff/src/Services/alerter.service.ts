import { Injectable } from '@nestjs/common';
import { EmailerService } from './emailer.service';
import { DisasterDataFromSQS } from '../DTO/disasterDataFromSQS';
import { AlertService } from './alert.service';
import { Alert } from '../Domain/alert.model';
import { AlertHistoryService } from './alertHistory.service';
import { CreateHistoryDto } from '../DTO/createHistory.dto';
import { CityService } from './city.service';
import { DisasterService } from './disaster.service';
import { Disaster } from '@disastream/models';
import { CityDistanceDto } from '../DTO/cityDistance.dto';
import { CustomLogger } from './logger.service';
import { AlertMailContent } from '../DTO/TemplatesDto/templateAlertDto';
import { DisasterStrategyRegistry } from '../Strategy/Aleas/disasterStrategy.registry';

/**
 * Service to send alerts to users
 */
@Injectable()
export class AlerterService {
  constructor(
    private emailerService: EmailerService,
    private alertService: AlertService,
    private alertHistoryService: AlertHistoryService,
    private cityService: CityService,
    private readonly logger: CustomLogger,
    private readonly disasterService: DisasterService,
    private readonly strategyRegistry: DisasterStrategyRegistry,
  ) { }

  /**
   * Write the content of email with disaster information
   * @param disasterData : result sent by SQS
   * @param alert : alert concerned by this disaster
   * @returns mail content
   */
  async makeMailFromDisasterType(
    disaster: Disaster,
    disasterData: DisasterDataFromSQS,
    alert: Alert,
    nearestCity: CityDistanceDto,
  ): Promise<AlertMailContent> {
    const strategy = this.strategyRegistry.getStrategy(disasterData.disaster_type);
    if (strategy === null) {
      this.logger.error(
        'Une erreur est survenue à la récupération de la stratégie.',
        null,
      );
      throw new Error();
    }
    return strategy.buildMailContent(
      disaster,
      disasterData,
      alert,
      nearestCity,
    );
  }

  /**
   * Real-time alert sent to user who's concerned by this disaster
   * @param disasterData : result sent by SQS
   */
  async sendRealTimeAlert(disasterData: DisasterDataFromSQS) {
    const disaster = await this.disasterService.findDisasterToSendInAlert(
      disasterData.disaster?.id,
      disasterData.disaster_type,
    );

    if (disaster === null) {
      this.logger.error(
        'Une erreur est survenue à la récupération de la disaster.',
        null,
      );
      throw new Error();
    }
    else {
      this.logger.log('Disaster ' + disasterData.disaster_type + ' récupérée.');
    }

    const nearestCity = await this.cityService.findById(
      disaster.nearestCityId,
      disaster.point,
    );

    const alertsToSend = await this.alertService.findUserToAlert(
      disasterData.disaster_type,
      disaster,
    );

    this.logger.log(
      `Nombre d'alertes à envoyer : ${alertsToSend.length}`,
    );

    // const template = readFileSync(
    //   path.resolve(__dirname, templatePath),
    //   'utf8',
    // );

    alertsToSend.forEach(async (alert: Alert) => {
      const mailContent = await this.makeMailFromDisasterType(
        disaster,
        disasterData,
        alert,
        nearestCity,
      );

      // const htmlContent = mustache.render(template, mailContent.templateData);

      alert.mailAlerts.forEach(async (mailAlert) => {
        if (process.env.ENVIRONMENT === 'qual') {
          this.logger.log(
            `Environnement de qualification - L'email d'alerte destiné à '${mailAlert.mail}' 
            n'a pas été envoyé mais envoyé à ' ${process.env.MAIL_TEST} '.`,
          );
          mailAlert.mail = process.env.MAIL_TEST;
        }

        await this.emailerService
          .sendTemplateEmail({
            to: mailAlert.mail,
            sender: process.env.DISASTREAM_MAIL,
            senderName: 'Kévin de Disastream',
            subject: mailContent.subjectMail,
            templateId: 7494519,
            variables: mailContent.templateData,
          })
          .then(() => {
            this.logger.log(
              `Une alerte vient d'être envoyée à l'adresse '${mailAlert.mail}' `,
            );
          });
      });

      const record: CreateHistoryDto = {
        alert: alert,
        notification: JSON.parse(JSON.stringify(mailContent.templateData)),
        disasterDataFromSQS: disasterData,
      };
      await this.alertHistoryService.create(record);
    });
  }
}
