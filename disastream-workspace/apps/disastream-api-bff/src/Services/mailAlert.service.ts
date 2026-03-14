import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MailAlert } from '../Domain/mailAlert.model';
import { Repository } from 'typeorm';
import { EmailerService } from './emailer.service';
import * as jwt from 'jsonwebtoken';
import { User } from '../Domain/user.model';

@Injectable()
export class MailAlertService {
  constructor(
    @InjectRepository(MailAlert)
    private mailAlertRepository: Repository<MailAlert>,
    private readonly mailService: EmailerService,
  ) { }

  async CreateMailAlert(userId: number, mail: string) {
    const mailUser = {
      mail: mail,
      userId: userId,
    };

    await this.mailAlertRepository.insert(mailUser);
    const mailAlert = await this.mailAlertRepository.findOneBy({
      mail: mail,
      userId: userId,
    });
    return mailAlert;
  }

  async sendConfirmationMailToMailAlert(
    emailAddress: string,
    masterUser: User,
    mailAlertId: number,
  ) {
    // Créer le token de vérification
    const emailVerificationToken = jwt.sign(
      { mail: emailAddress, masterId: masterUser.id },
      process.env.DISASTREAM_SECRET,
      { expiresIn: '1h' },
    );

    // Envoi de l'email de confirmation
    const confirmationUrl = `${process.env.DISASTREAM_FRONT_BASE_URI}/confirm-association?token=${encodeURIComponent(emailVerificationToken)}&ma=${mailAlertId}&master=${masterUser.username}`;
    await this.mailService.sendConfirmationMailToMailAlert(
      emailAddress,
      confirmationUrl,
      masterUser,
    );
  }

  async getMailAdressesOfUser(id: number): Promise<MailAlert[]> {
    const mailAlerts = await this.mailAlertRepository.findBy({ userId: id });
    return mailAlerts;
  }

  async findById(id: number) {
    const mailAlert = this.mailAlertRepository.findOneBy({
      id: id,
    });
    return mailAlert;
  }

  async verifyAssociatedMailAlert(mail: string, masterUserId: number) {
    await this.mailAlertRepository.update(
      { mail: mail, userId: masterUserId },
      { isVerified: true },
    );
  }
}
