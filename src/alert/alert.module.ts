import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Alert } from './alert.entity';
import { SensorModule } from '../sensor/sensor.module';
import { AlertController } from './alert.controller';
import { AlertService } from './alert.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Alert]),
        SensorModule,
    ],
    controllers: [AlertController],
    providers: [AlertService],
    exports: [AlertService],
})
export class AlertModule { }
