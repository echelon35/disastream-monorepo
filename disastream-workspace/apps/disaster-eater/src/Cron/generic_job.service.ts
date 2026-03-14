import { Injectable, Logger } from '@nestjs/common';
import { Disaster } from '@disastream/models';
import { lastValueFrom, isObservable } from 'rxjs';
import { GenericEater } from '../Application/generic_eater.service';
import { IDisasterProvider } from '../Application/Interfaces/IDisasterProvider';

@Injectable()
export class GenericJob<T extends Disaster> {
    private readonly logger = new Logger(GenericJob.name);

    constructor(
        private eater: GenericEater<T>,
        private providers: IDisasterProvider<T>[],
    ) { }

    async executeJob(jobName: string): Promise<T[]> {
        this.logger.log(`Let's search some ${jobName}s`);

        let allDisasters: T[] = [];

        try {
            for (const provider of this.providers) {
                try {
                    // Check if provider returns Observable or Promise
                    const result = provider.fetchData();
                    let data: T[];

                    if (isObservable(result)) {
                        data = await lastValueFrom(result);
                    } else {
                        data = await result;
                    }

                    allDisasters = [...allDisasters, ...data];
                } catch (providerError) {
                    this.logger.error(`Error with provider ${provider.sourceName} for ${jobName}`, providerError);
                }
            }

            await this.eater.bulkRecord(allDisasters);

            this.logger.log(`${allDisasters.length} ${jobName}s found and processed.`);

            return allDisasters;
        } catch (error) {
            this.logger.error(
                `Error during generic job execution for ${jobName} : `,
                error,
            );
            throw new Error(`Failed to retrieve generic ${jobName} data`);
        }
    }
}
