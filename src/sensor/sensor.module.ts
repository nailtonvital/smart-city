import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sensor } from './sensor.entity';
import { SensorController } from './sensor.controller';
import { SensorService } from './sensor.service';

@Module({
    imports: [TypeOrmModule.forFeature([Sensor])],
    controllers: [SensorController],
    providers: [SensorService],
    exports: [SensorService],
})
export class SensorModule { }
