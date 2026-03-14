import { DisasterReceivedFromSQS } from './DisasterReceivedFromSQS';

export enum InsertType {
  CREATION = 'create',
  UPDATE = 'update',
}

export class DisasterDataFromSQS {
  type: InsertType;
  disaster_type: string;
  disaster: DisasterReceivedFromSQS;
}
