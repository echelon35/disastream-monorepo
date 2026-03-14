import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { DisasterDataFromSQS } from '../DTO/disasterDataFromSQS';
import { Injectable } from '@nestjs/common';
import { INotifierService } from './Interfaces/INotifier.service';
import { CustomLogger } from './logger.service';

@Injectable()
export class NotifierService implements INotifierService {
  constructor(private readonly loggerService: CustomLogger) { }
  sqsClient = new SQSClient({
    region: process.env.SCW_REGION,
    endpoint: 'https://sqs.mnq.fr-par.scaleway.com',
    credentials: {
      accessKeyId: process.env.SCW_ACCESS_KEY_ID!,
      secretAccessKey: process.env.SCW_SECRET_ACCESS_KEY!,
    },
  });

  async sendNotification(disasterData: DisasterDataFromSQS): Promise<void> {
    if (
      disasterData.disaster === null ||
      disasterData.disaster?.source === null
    ) {
      return;
    }

    const deduplicationId = `${disasterData.disaster_type}-${disasterData.disaster?.source?.name}-${disasterData.disaster?.idFromSource}`;

    const params = {
      QueueUrl: process.env.SCW_QUEUE,
      MessageBody: JSON.stringify(disasterData),
      MessageGroupId: disasterData.disaster_type + '_group',
      MessageDeduplicationId: deduplicationId,
    };

    const command = new SendMessageCommand(params);
    try {
      await this.sqsClient.send(command);
      this.loggerService.log(
        `Notification ${params.MessageDeduplicationId} sent by DisasterEater`,
      );
      // console.log('Message sent to SQS:', data);
    } catch (err) {
      console.error('Error sending message to SQS:', err);
      this.loggerService.error(
        `Error sending ${params.MessageDeduplicationId} to SQS by DisasterEater`,
        err,
      );
    }
  }
}
