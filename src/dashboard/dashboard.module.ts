import { Module } from '@nestjs/common';
import { SensorModule } from '../sensor/sensor.module';
import { AlertModule } from '../alert/alert.module';
import { PopulationModule } from '../population/population.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
    imports: [SensorModule, AlertModule, PopulationModule],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule { }
