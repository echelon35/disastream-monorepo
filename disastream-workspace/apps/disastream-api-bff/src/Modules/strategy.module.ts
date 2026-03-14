import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Earthquake, Flood, Hurricane, Eruption } from '@disastream/models';
import { DisasterStrategyRegistry } from '../Strategy/Aleas/disasterStrategy.registry';
import { EarthquakeStrategy } from '../Strategy/Aleas/earthquake.strategy';
import { FloodStrategy } from '../Strategy/Aleas/flood.strategy';
import { HurricaneStrategy } from '../Strategy/Aleas/hurricane.strategy';
import { EruptionStrategy } from '../Strategy/Aleas/eruption.strategy';

@Module({
    imports: [
        TypeOrmModule.forFeature([Earthquake, Flood, Hurricane, Eruption], 'DisasterDb'),
    ],
    providers: [
        EarthquakeStrategy,
        FloodStrategy,
        HurricaneStrategy,
        EruptionStrategy,
        {
            provide: DisasterStrategyRegistry,
            useFactory: (...strategies) => new DisasterStrategyRegistry(strategies),
            inject: [EarthquakeStrategy, FloodStrategy, HurricaneStrategy, EruptionStrategy],
        },
    ],
    exports: [DisasterStrategyRegistry],
})
export class StrategyModule { }
