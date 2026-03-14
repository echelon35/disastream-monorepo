import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { User } from '../Domain/user.model';
import { CustomLogger } from './logger.service';
import { Client } from 'node-mailjet';

/**
 * Service to send alerts to users
 */
@Injectable()
export class EmailerService {
  private transporter: any;
  private mailjet: any;

  constructor(private readonly logger: CustomLogger) {
    this.transporter = nodemailer.createTransport({
      host: 'in-v3.mailjet.com',
      port: 587,
      auth: {
        user: process.env.MAILJET_API_KEY,
        pass: process.env.MAILJET_API_SECRET,
      },
    });
    this.mailjet = new Client({
      apiKey: process.env.MAILJET_API_KEY,
      apiSecret: process.env.MAILJET_API_SECRET,
    });
  }

  async sendEmail(toEmail: string, subject: string, htmlContent: any) {
    const mailOptions = {
      from: process.env.DISASTREAM_MAIL, // Email expéditeur
      to: toEmail, // Destinataire
      subject: subject, // Sujet du mail
      html: htmlContent, // Contenu HTML du mail
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      this.logger.error(
        `Erreur lors de l'envoi de l'email à ${toEmail}: ${error}`,
        error.stack,
      );
    }
  }

  async sendConfirmationMail(mail: string, url: string) {
    const mailOptions = {
      from: process.env.DISASTREAM_MAIL, // Email expéditeur
      to: mail, // Destinataire
      subject: 'Confirmez votre adresse mail', // Sujet du mail
      html: `<p>Veuillez confirmer votre adresse email en cliquant sur le lien suivant :</p>
             <a href="${url}">Confirmer mon adresse email</a>`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      this.logger.error(
        `Erreur lors de l'envoi de l'email de confirmation à ${mail}: ${error}`,
        error.stack,
      );
    }
  }

  async sendPasswordReinitialization(mail: string, url: string) {
    const mailOptions = {
      from: process.env.DISASTREAM_MAIL, // Email expéditeur
      to: mail, // Destinataire
      subject: 'Réinitialisez votre mot de passe', // Sujet du mail
      html: `<p>Veuillez réinitialiser votre mot de passe en cliquant sur le lien suivant :</p>
             <a href="${url}">Réinitialiser mon mot de passe</a>
             <p>Vous n'êtes pas l'auteur de cette ré-initialisation ? Merci de ne pas tenir compte de cet email.</p>`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      this.logger.error(
        `Erreur lors de l'envoi de l'email de réinitialisation à ${mail}: ${error}`,
        error.stack,
      );
    }
  }

  async sendConfirmationMailToMailAlert(
    mail: string,
    url: string,
    masterUser: User,
  ) {
    const mailOptions = {
      from: process.env.DISASTREAM_MAIL, // Email expéditeur
      to: mail, // Destinataire
      subject: `${masterUser.username} vous a associé à son compte DisaStream`, // Sujet du mail
      html: `<p>${masterUser.username} vous a associé à son compte DisaStream</p>
            <p>Veuillez confirmer l'association à votre adresse email en cliquant sur le lien suivant :</p>
             <a href="${url}">Confirmer l'association</a>`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      this.logger.error(
        `Erreur lors de l'envoi de l'email d'association à ${mail}: ${error}`,
        error.stack,
      );
    }
  }

  async sendTemplateEmail({
    to,
    subject,
    sender,
    senderName,
    templateId,
    variables,
  }: {
    to: string;
    sender: string;
    senderName?: string;
    subject: string;
    templateId: number;
    variables: Record<string, any>;
  }) {
    try {
      const response = await this.mailjet
        .post('send', { version: 'v3.1' })
        .request({
          Messages: [
            {
              From: {
                Email: sender,
                Name: senderName ?? 'Disastream',
              },
              To: [
                {
                  Email:
                    process.env.ENVIRONMENT === 'qual'
                      ? process.env.MAIL_TEST
                      : to,
                },
              ],
              TemplateID: templateId,
              TemplateLanguage: true,
              Variables: variables,
              Subject: subject,
            },
          ],
        });

      return response.body;
    } catch (error) {
      console.error('Mailjet error', error);
      throw error;
    }
  }
}
