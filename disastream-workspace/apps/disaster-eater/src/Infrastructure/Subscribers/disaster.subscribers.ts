import { Injectable } from '@nestjs/common';
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { Earthquake, Flood, Hurricane, Eruption } from '@disastream/models';
import { CustomLogger } from '../../Application/logger.service';
import { NotifierService } from '../../Application/notifier.service';
import { DisasterToSendToSQS } from '../../DTO/DisasterToSendToSQS';
import { InsertType } from '../../DTO/disasterDataFromSQS';

// ---------------------------------------------------------
// EARTHQUAKE SUBSCRIBER
// ---------------------------------------------------------
@Injectable()
@EventSubscriber()
export class EarthquakeSubscriber implements EntitySubscriberInterface<Earthquake> {
    constructor(
        private readonly dataSource: DataSource,
        private readonly loggerService: CustomLogger,
        private readonly notifierService: NotifierService,
    ) {
        dataSource.subscribers.push(this);
    }

    listenTo() { return Earthquake; }

    afterInsert(event: InsertEvent<Earthquake>) {
        if (event?.entity?.id !== undefined) {
            const entity = event.entity;
            if (entity.createdAt < entity.updatedAt) {
                this.loggerService.log(`Updated Earthquake M${entity.magnitude} dated from ${entity.premier_releve}`);
            } else {
                this.loggerService.log(`Created Earthquake M${entity.magnitude} dated from ${entity.premier_releve}`);
                this.notifierService.sendNotification({
                    type: InsertType.CREATION,
                    disaster_type: 'earthquake',
                    disaster: new DisasterToSendToSQS(entity),
                });
            }
        }
    }
}

// ---------------------------------------------------------
// FLOOD SUBSCRIBER
// ---------------------------------------------------------
@Injectable()
@EventSubscriber()
export class FloodSubscriber implements EntitySubscriberInterface<Flood> {
    constructor(
        private readonly dataSource: DataSource,
        private readonly loggerService: CustomLogger,
        private readonly notifierService: NotifierService,
    ) {
        dataSource.subscribers.push(this);
    }

    listenTo() { return Flood; }

    afterInsert(event: InsertEvent<Flood>) {
        if (event?.entity?.id !== undefined) {
            const entity = event.entity;
            if (entity.createdAt < entity.updatedAt) {
                this.loggerService.log(`Updated Flood dated from ${entity.premier_releve}`);
                this.notifierService.sendNotification({
                    type: InsertType.UPDATE,
                    disaster_type: 'flood',
                    disaster: new DisasterToSendToSQS(entity),
                });
            } else {
                this.loggerService.log(`Created Flood dated from ${entity.premier_releve}`);
                this.notifierService.sendNotification({
                    type: InsertType.CREATION,
                    disaster_type: 'flood',
                    disaster: new DisasterToSendToSQS(entity),
                });
            }
        }
    }
}

// ---------------------------------------------------------
// HURRICANE SUBSCRIBER
// ---------------------------------------------------------
@Injectable()
@EventSubscriber()
export class HurricaneSubscriber implements EntitySubscriberInterface<Hurricane> {
    constructor(
        private readonly dataSource: DataSource,
        private readonly loggerService: CustomLogger,
        private readonly notifierService: NotifierService,
    ) {
        dataSource.subscribers.push(this);
    }

    listenTo() { return Hurricane; }

    afterInsert(event: InsertEvent<Hurricane>) {
        if (event?.entity?.id !== undefined) {
            const entity = event.entity;
            if (entity.createdAt < entity.updatedAt) {
                this.loggerService.log(`Updated Hurricane ${entity.name || ''} dated from ${entity.premier_releve}`);
                this.notifierService.sendNotification({
                    type: InsertType.UPDATE,
                    disaster_type: 'hurricane',
                    disaster: new DisasterToSendToSQS(entity),
                });
            } else {
                this.loggerService.log(`Created Hurricane ${entity.name || ''} dated from ${entity.premier_releve}`);
                this.notifierService.sendNotification({
                    type: InsertType.CREATION,
                    disaster_type: 'hurricane',
                    disaster: new DisasterToSendToSQS(entity),
                });
            }
        }
    }
}

// ---------------------------------------------------------
// ERUPTION SUBSCRIBER
// ---------------------------------------------------------
@Injectable()
@EventSubscriber()
export class EruptionSubscriber implements EntitySubscriberInterface<Eruption> {
    constructor(
        private readonly dataSource: DataSource,
        private readonly loggerService: CustomLogger,
        private readonly notifierService: NotifierService,
    ) {
        dataSource.subscribers.push(this);
    }

    listenTo() { return Eruption; }

    afterInsert(event: InsertEvent<Eruption>) {
        if (event?.entity?.id !== undefined) {
            const entity = event.entity;
            if (entity.createdAt < entity.updatedAt) {
                this.loggerService.log(`Updated Eruption ${entity.name || ''} dated from ${entity.premier_releve}`);
            } else {
                this.loggerService.log(`Created Eruption ${entity.name || ''} dated from ${entity.premier_releve}`);
                this.notifierService.sendNotification({
                    type: InsertType.CREATION,
                    disaster_type: 'eruption',
                    disaster: new DisasterToSendToSQS(entity),
                });
            }
        }
    }
}
