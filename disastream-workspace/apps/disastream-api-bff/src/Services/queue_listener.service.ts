import { SQS } from '@aws-sdk/client-sqs';
import { Injectable } from '@nestjs/common';
import { AlerterService } from './alerter.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CustomLogger } from './logger.service';

@Injectable()
export class QueueListenerService {
  private sqs: SQS;

  constructor(
    private readonly alerterService: AlerterService,
    private readonly logger: CustomLogger,
  ) {
    this.sqs = new SQS({
      region: process.env.SCW_REGION,
      endpoint: 'https://sqs.mnq.fr-par.scaleway.com',
      credentials: {
        accessKeyId: process.env.SCW_ACCESS_KEY_ID!,
        secretAccessKey: process.env.SCW_SECRET_ACCESS_KEY!,
      },
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async pollMessagesFromSQS(): Promise<void> {
    this.logger.log("Let's check the queue");
    const queueUrl = process.env.SCW_QUEUE;
    const maxNumber = process.env.ENVIRONMENT === 'qual' ? 1 : 10;

    const params = {
      QueueUrl: queueUrl,
      MaxNumberOfMessages: maxNumber, // Nombre maximum de messages à traiter par lot
      WaitTimeSeconds: 20, // Long polling: attend jusqu'à 20 secondes avant de retourner une réponse si aucun message n'est disponible
    };

    try {
      const result = await this.sqs.receiveMessage(params);

      if (result.Messages && result.Messages.length > 0) {
        for (const message of result.Messages) {
          // console.log(`Message reçu : ${message.Body}`);
          const currentDisasterData = JSON.parse(message.Body);

          await this.alerterService
            .sendRealTimeAlert(currentDisasterData)
            .then(async () => {
              await this.deleteMessageFromQueue(
                queueUrl,
                message.ReceiptHandle,
              );
            });
        }
      }
    } catch (error) {
      this.logger.error(
        'Erreur lors de la réception des messages de SQS',
        error.stack,
      );
    }
  }

  private async deleteMessageFromQueue(
    queueUrl: string,
    receiptHandle: string,
  ): Promise<void> {
    try {
      await this.sqs.deleteMessage({
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
      });
    } catch (error) {
      this.logger.error(
        'Erreur lors de la suppression du message de SQS',
        error.stack,
      );
    }
  }
}
