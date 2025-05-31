import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DashboardModule } from './dashboard/dashboard.module';
import { SensorModule } from './sensor/sensor.module';
import { AlertModule } from './alert/alert.module';
import { PopulationModule } from './population/population.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'smart-city.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    SensorModule,
    AlertModule,
    PopulationModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
