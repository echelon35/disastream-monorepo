import { Disaster, Source } from '@disastream/models';

/**
 * Properties of disaster received from sqs
 */
export class DisasterReceivedFromSQS {
  id: number;
  source: Source;
  idFromSource: string;

  constructor(disaster: Disaster) {
    this.id = disaster.id;
    this.source = disaster.source;
    this.idFromSource = disaster.idFromSource;
  }
}
