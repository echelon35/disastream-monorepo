export interface INotifierService {
  sendNotification(disasterData: any): Promise<void>;
}

export const INotifierService = Symbol('INotifierService');
