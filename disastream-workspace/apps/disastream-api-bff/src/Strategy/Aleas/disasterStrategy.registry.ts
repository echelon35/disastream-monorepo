import { Injectable, Logger } from '@nestjs/common';
import { IDisasterStrategy } from './IDisasterStrategy';

@Injectable()
export class DisasterStrategyRegistry {
    private readonly logger = new Logger(DisasterStrategyRegistry.name);
    private strategies = new Map<string, IDisasterStrategy>();

    constructor(strategies: IDisasterStrategy[]) {
        // Register all injected strategies by their type
        for (const strategy of strategies) {
            this.strategies.set(strategy.type, strategy);
        }
        this.logger.log(`Registered ${this.strategies.size} disaster strategies.`);
    }

    getStrategy(type: string): IDisasterStrategy {
        const strategy = this.strategies.get(type);
        if (!strategy) {
            throw new Error(`No strategy found for disaster type: ${type}`);
        }
        return strategy;
    }

    getAllStrategies(): IDisasterStrategy[] {
        return Array.from(this.strategies.values());
    }
}
