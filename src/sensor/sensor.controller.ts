import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { SensorService } from './sensor.service';
import { Sensor } from './sensor.entity';

@Controller('sensors')
export class SensorController {
    constructor(private readonly sensorService: SensorService) { }

    @Get()
    async findAll(): Promise<Sensor[]> {
        return this.sensorService.findAll();
    }

    @Get('nearby')
    async findNearby(
        @Query('lat') latitude: number,
        @Query('lng') longitude: number,
        @Query('radius') radius?: number,
    ): Promise<Sensor[]> {
        return this.sensorService.findByLocation(latitude, longitude, radius);
    }

    @Get(':id')
    async findOne(@Param('id') id: number): Promise<Sensor | null> {
        if (!id) {
            throw new Error('ID is required to find a sensor');
        }

        return this.sensorService.findOne(id);
    }

    @Post()
    async create(@Body() sensorData: Partial<Sensor>): Promise<Sensor> {
        return this.sensorService.create(sensorData);
    }

    @Put(':id')
    async update(
        @Param('id') id: number,
        @Body() updateData: Partial<Sensor>,
    ): Promise<Sensor | null> {
        if (!id) {
            throw new Error('ID is required to update a sensor');
        }
        const result = await this.sensorService.update(id, updateData);
        if (result === null) {
            throw new Error(`Sensor with ID ${id} not found`);
        }
        return result;
    }

    @Delete(':id')
    async delete(@Param('id') id: number): Promise<void> {
        return this.sensorService.delete(id);
    }

    @Post('initialize')
    async initializeFakeSensors(): Promise<{ message: string }> {
        await this.sensorService.initializeFakeSensors();
        return { message: 'Sensores fictícios inicializados com sucesso!' };
    }
}
