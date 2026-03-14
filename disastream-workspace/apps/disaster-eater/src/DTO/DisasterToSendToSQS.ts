import { Disaster, Source } from '@disastream/models';

/**
 * Only send to SQS the required properties
 */
export class DisasterToSendToSQS {
  id: number;
  source: Source;
  idFromSource: string;

  constructor(disaster: Disaster) {
    this.id = disaster.id;
    this.source = disaster.source;
    this.idFromSource = disaster.idFromSource;
  }
}
