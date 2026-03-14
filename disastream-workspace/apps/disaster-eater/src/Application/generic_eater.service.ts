import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CityService } from './city.service';
import { CustomLogger } from './logger.service';
import { NotifierService } from './notifier.service';
import { Disaster } from '@disastream/models';
import { DisasterToSendToSQS } from '../DTO/DisasterToSendToSQS';
import { InsertType } from '../DTO/disasterDataFromSQS';

// Configuration for which hazards should send an UPDATE notification to SQS
const SHOULD_NOTIFY_ON_UPDATE = {
    earthquake: false,
    flood: true,
    hurricane: true,
    eruption: false,
};

@Injectable()
export class GenericEater<T extends Disaster> {
    constructor(
        private readonly entityObj: new () => T,
        private readonly loggerService: CustomLogger,
        private dataSource: DataSource,
        private readonly cityService: CityService
    ) { }

    /**
     * Save disasters into db
     * @param disasters
     */
    async bulkRecord(disasters: T[]): Promise<void> {
        if (!disasters || disasters.length === 0) return;

        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();

        /** UPSERT DISASTERS */
        await queryRunner.startTransaction();

        try {

            const disasterType = new this.entityObj().constructor.name.toLowerCase();

            for (const disaster of disasters) {
                // UPDATE NEAREST CITY
                disaster.nearestCityId = await this.cityService.findNearestTown(
                    disaster.point,
                );
            }

            await queryRunner.manager.upsert(this.entityObj, disasters as any, {
                skipUpdateIfNoValuesChanged: true,
                conflictPaths: ['idFromSource', 'source'],
            });
            await queryRunner.commitTransaction();

        } catch (err) {
            // since we have errors lets rollback the changes we made
            this.loggerService.log(
                'An error occured during disaster record : ' + err.toString(),
            );
            await queryRunner.rollbackTransaction();
        } finally {
            // you need to release a queryRunner which was manually instantiated
            await queryRunner.release();
        }
    }
}
