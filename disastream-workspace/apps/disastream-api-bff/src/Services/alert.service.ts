import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Disaster } from '@disastream/models';
import { CreateAlertDto } from '../DTO/createAlert.dto';
import { EditAlertDto } from '../DTO/editAlert.dto';
import { Alert, AlertCriteria } from '../Domain/alert.model';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CriteriaMatcher } from '../Common/Utils/CriteriaMatcher';
import { EmailerService } from './emailer.service';
import {
  ExpiredAlertMailContent,
  TemplateExpiredAlertData,
} from '../DTO/TemplatesDto/templateExpiredAlertDto';
import { MailAlert } from '../Domain/mailAlert.model';

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);

  constructor(
    @InjectRepository(Alert) private alertRepository: Repository<Alert>,
    private emailerService: EmailerService,
  ) {}

  async activate(id: number, userId: number, isActivate: boolean) {
    return await this.alertRepository.update(
      {
        id: id,
        userId: userId,
      },
      {
        isActivate: isActivate,
      },
    );
  }

  async CreateAlert(alert: CreateAlertDto) {
    if (alert.expirationDate) {
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 2);
      if (new Date(alert.expirationDate) < minDate) {
        throw new Error(
          'Expiration date must be at least 2 days in the future',
        );
      }
    }
    const created = await this.alertRepository.save(alert);
    const newAlert = this.alertRepository.findOneBy({ id: created.id });
    return newAlert;
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async CheckForExpiredAlerts() {
    this.logger.debug('Checking for expired alerts...');
    const now = new Date();
    const expiredAlerts = await this.alertRepository.find({
      where: {
        isActivate: true,
        expirationDate: LessThan(now),
      },
      relations: ['mailAlerts'],
    });

    if (expiredAlerts.length > 0) {
      for (const alert of expiredAlerts) {
        this.logger.debug(`${alert.name} is expired. Deactivating...`);
        alert.isActivate = false;
        await this.alertRepository.save(alert);

        if (alert.mailAlerts == null || alert.mailAlerts.length === 0) {
          this.logger.debug(
            `${alert.name} is expired but has no mail alerts. Deactivating without sending email...`,
          );
          continue;
        }

        const mailData = new TemplateExpiredAlertData();
        mailData.title = `Votre alerte "${alert.name}" a expiré`;
        mailData.subtitle = `Vous ne recevrez plus de notifications pour cette alerte. Vous pouvez la réactiver ou la modifier à tout moment.`;
        mailData.linkSource = `${process.env.DISASTREAM_FRONT_BASE_URI}/dashboard/alert/edit?id=${alert.id}`;
        mailData.modifyAlert = `${process.env.DISASTREAM_FRONT_BASE_URI}/dashboard/alert/edit?id=${alert.id}`;
        mailData.myAlerts = `${process.env.DISASTREAM_FRONT_BASE_URI}/dashboard/map`;

        const templateContent = new ExpiredAlertMailContent();
        templateContent.templateData = mailData;
        templateContent.subjectMail =
          process.env.ENVIRONMENT === 'qual' ? '[QUAL]' : '';
        templateContent.subjectMail += mailData.title;

        alert.mailAlerts.forEach(async (mailAlert: MailAlert) => {
          if (process.env.ENVIRONMENT === 'qual') {
            this.logger.log(
              `Environnement de qualification - L'email d'expiration d'alerte destiné à '${mailAlert.mail}' 
            n'a pas été envoyé mais envoyé à ' ${process.env.MAIL_TEST} '.`,
            );
            mailAlert.mail = process.env.MAIL_TEST;
          }

          await this.emailerService
            .sendTemplateEmail({
              to: mailAlert.mail,
              sender: process.env.DISASTREAM_MAIL,
              senderName: 'Kévin de Disastream',
              subject: templateContent.subjectMail,
              templateId: +process.env.TEMPLATE_ID_ALERT_EXPIRATION,
              variables: templateContent.templateData,
            })
            .then(() => {
              this.logger.log(
                `Un mail d'expiration a été envoyé à l'adresse '${mailAlert.mail}' `,
              );
            });
        });
      }
    } else {
      this.logger.debug('No expired alerts found.');
    }
  }

  async getAlert(id: number, userId: number): Promise<Alert | null> {
    const result = await this.alertRepository
      .createQueryBuilder('alert')
      .leftJoinAndSelect('alert.aleas', 'alea')
      .leftJoinAndSelect('alert.mailAlerts', 'mailAlert')
      .where({ userId: userId, id: id })
      .getOne();

    return result;
  }

  async updateAlert(alert: EditAlertDto): Promise<Alert | null> {
    await this.alertRepository.save(alert);
    const updatedAlert = this.alertRepository.findOneBy({ id: alert.id });
    return updatedAlert;
  }

  async deleteAlert(userId: number, deleteId: number): Promise<boolean> {
    const result = await this.alertRepository.softDelete({
      id: deleteId,
      userId: userId,
    });

    return result.affected > 0;
  }

  async getUserAlerts(userId: number) {
    const alerts = await this.alertRepository
      .createQueryBuilder('alert')
      .leftJoinAndSelect('alert.aleas', 'alea')
      .leftJoinAndSelect('alert.mailAlerts', 'mailAlert')
      .where({ userId: userId })
      .getMany();

    return alerts;
  }

  async filterAlertsByCriterias(
    alerts: Alert[],
    disaster: Disaster,
    disaster_type: string,
  ) {
    return alerts.filter((alert) => {
      return CriteriaMatcher.match(
        alert.criterias as AlertCriteria[],
        disaster,
        disaster_type,
      );
    });
  }

  async findUserToAlert(disaster_type: string, disaster: Disaster) {
    const alerts = await this.alertRepository
      .createQueryBuilder('alert')
      .leftJoinAndSelect('alert.aleas', 'aleas')
      .leftJoinAndSelect('alert.mailAlerts', 'mailAlerts')
      .where(
        '(ST_Contains(alert.areas,ST_GeomFromGeoJSON(:point)) OR alert.areas is null) AND (:type IN (aleas.name)) AND alert.isActivate',
        {
          point: disaster.point,
          type: disaster_type,
        },
      )
      .getMany();

    return await this.filterAlertsByCriterias(alerts, disaster, disaster_type);
  }
}
