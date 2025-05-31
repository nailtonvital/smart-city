import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Sensor, SensorType, SensorStatus } from './sensor.entity';

@Injectable()
export class SensorService {
    constructor(
        @InjectRepository(Sensor)
        private sensorRepository: Repository<Sensor>,
    ) { }

    async findAll(): Promise<Sensor[]> {
        return this.sensorRepository.find();
    }

    async findOne(id: number): Promise<Sensor | null> {
        if (!id) {
            throw new Error('ID is required to find a sensor');
        }
        return this.sensorRepository.findOneBy({ id });
    }

    async create(sensorData: Partial<Sensor>): Promise<Sensor> {
        const sensor = this.sensorRepository.create(sensorData);
        return this.sensorRepository.save(sensor);
    }

    async update(id: number, updateData: Partial<Sensor>): Promise<Sensor | null> {
        if (!id) {
            throw new Error('ID is required to update a sensor');
        }
        if (!updateData) {
            throw new Error('Update data is required');
        }

        await this.sensorRepository.update(id, updateData);
        return this.findOne(id);
    }

    async delete(id: number): Promise<void> {
        await this.sensorRepository.delete(id);
    }

    async findByLocation(latitude: number, longitude: number, radius: number = 5): Promise<Sensor[]> {
        return this.sensorRepository
            .createQueryBuilder('sensor')
            .where(
                `(6371 * acos(cos(radians(:lat)) * cos(radians(sensor.latitude)) * cos(radians(sensor.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(sensor.latitude)))) < :radius`,
                { lat: latitude, lng: longitude, radius }
            )
            .getMany();
    }

    async updateSensorReading(id: number, value: number): Promise<void> {
        await this.sensorRepository.update(id, {
            currentValue: value,
            lastReading: new Date(),
        });
    }

    // Cron job para simular leituras de sensores a cada 5 minutos
    @Cron(CronExpression.EVERY_SECOND)
    async simulateSensorReadings() {
        console.log('🔄 Simulando leituras de sensores...');

        const sensors = await this.sensorRepository.find({
            where: { status: SensorStatus.ACTIVE }
        });

        for (const sensor of sensors) {
            const simulatedValue = this.generateSimulatedValue(sensor.type);
            await this.updateSensorReading(sensor.id, simulatedValue);
        }

        console.log(`✅ Atualizadas ${sensors.length} leituras de sensores`);
    }

    // Inicializar sensores fictícios
    async initializeFakeSensors() {
        const existingSensors = await this.sensorRepository.count();

        if (existingSensors > 0) {
            console.log('Sensores já existem no banco de dados');
            return;
        }

        const fakeSensors = [
            {
                name: 'Sensor Temperatura Centro',
                type: SensorType.TEMPERATURE,
                latitude: -23.5505,
                longitude: -46.6333,
                location: 'Centro de São Paulo',
                unit: '°C',
                minThreshold: 5,
                maxThreshold: 40,
            },
            {
                name: 'Sensor Qualidade do Ar Vila Madalena',
                type: SensorType.AIR_QUALITY,
                latitude: -23.5598,
                longitude: -46.6890,
                location: 'Vila Madalena',
                unit: 'AQI',
                minThreshold: 0,
                maxThreshold: 150,
            },
            {
                name: 'Sensor Tráfego Av. Paulista',
                type: SensorType.TRAFFIC,
                latitude: -23.5613,
                longitude: -46.6565,
                location: 'Avenida Paulista',
                unit: 'veículos/min',
                minThreshold: 0,
                maxThreshold: 100,
            },
            {
                name: 'Sensor Umidade Ibirapuera',
                type: SensorType.HUMIDITY,
                latitude: -23.5873,
                longitude: -46.6578,
                location: 'Parque Ibirapuera',
                unit: '%',
                minThreshold: 30,
                maxThreshold: 90,
            },
            {
                name: 'Sensor Ruído Liberdade',
                type: SensorType.NOISE,
                latitude: -23.5587,
                longitude: -46.6347,
                location: 'Bairro da Liberdade',
                unit: 'dB',
                minThreshold: 30,
                maxThreshold: 85,
            },
            {
                name: 'Sensor Enchente Marginal',
                type: SensorType.FLOOD,
                latitude: -23.5290,
                longitude: -46.6658,
                location: 'Marginal Tietê',
                unit: 'cm',
                minThreshold: 0,
                maxThreshold: 200,
            },
        ];

        for (const sensorData of fakeSensors) {
            await this.create(sensorData);
        }

        console.log('✅ Sensores fictícios criados com sucesso!');
    }

    private generateSimulatedValue(type: SensorType): number {
        switch (type) {
            case SensorType.TEMPERATURE:
                return Math.round((Math.random() * 30 + 10) * 100) / 100; // 10-40°C
            case SensorType.HUMIDITY:
                return Math.round((Math.random() * 60 + 30) * 100) / 100; // 30-90%
            case SensorType.AIR_QUALITY:
                return Math.round(Math.random() * 200); // 0-200 AQI
            case SensorType.NOISE:
                return Math.round((Math.random() * 50 + 30) * 100) / 100; // 30-80 dB
            case SensorType.TRAFFIC:
                return Math.round(Math.random() * 80 + 10); // 10-90 veículos/min
            case SensorType.FLOOD:
                return Math.round((Math.random() * 150) * 100) / 100; // 0-150 cm
            case SensorType.EARTHQUAKE:
                return Math.round((Math.random() * 5) * 100) / 100; // 0-5 magnitude
            default:
                return Math.round((Math.random() * 100) * 100) / 100;
        }
    }
}
