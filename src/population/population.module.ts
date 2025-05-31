import { Module } from '@nestjs/common';
import { PopulationReport } from './population-report.entity';
import { PopulationController } from './population.controller';
import { PopulationService } from './population.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([PopulationReport])],
    controllers: [PopulationController],
    providers: [PopulationService],
    exports: [PopulationService],
})
export class PopulationModule { }
