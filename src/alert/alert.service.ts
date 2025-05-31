import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Alert, AlertLevel, AlertStatus } from './alert.entity';
import { SensorService } from '../sensor/sensor.service';
import { SensorType } from '../sensor/sensor.entity';

@Injectable()
export class AlertService {
    constructor(
        @InjectRepository(Alert)
        private alertRepository: Repository<Alert>,
        private sensorService: SensorService,
    ) { }

    async findAll(): Promise<Alert[]> {
        return this.alertRepository.find({
            relations: ['sensor'],
            order: { createdAt: 'DESC' },
        });
    }

    async findActive(): Promise<Alert[]> {
        return this.alertRepository.find({
            where: { status: AlertStatus.ACTIVE },
            relations: ['sensor'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Alert | null> {
        return this.alertRepository.findOne({
            where: { id },
            relations: ['sensor'],
        });
    }

    async create(alertData: Partial<Alert>): Promise<Alert> {
        const alert = this.alertRepository.create(alertData);
        return this.alertRepository.save(alert);
    }

    async update(id: number, updateData: Partial<Alert>): Promise<Alert | null> {
        if (!id || !updateData) {
            throw new Error('ID and update data are required');
        }
        await this.alertRepository.update(id, updateData);
        return this.findOne(id);
    }

    async acknowledge(id: number): Promise<Alert | null> {
        return this.update(id, {
            status: AlertStatus.ACKNOWLEDGED,
            acknowledgedAt: new Date(),
        });
    }

    async resolve(id: number): Promise<Alert | null> {
        return this.update(id, {
            status: AlertStatus.RESOLVED,
            resolvedAt: new Date(),
        });
    }

    async delete(id: number): Promise<void> {
        await this.alertRepository.delete(id);
    }

    // Cron job para verificar thresholds dos sensores a cada 2 minutos
    @Cron(CronExpression.EVERY_SECOND)
    async checkSensorThresholds() {
        console.log('🚨 Verificando thresholds dos sensores...');

        const sensors = await this.sensorService.findAll();
        let alertsGenerated = 0;

        for (const sensor of sensors) {
            if (!sensor.currentValue || !sensor.maxThreshold) continue;

            const isThresholdExceeded = sensor.currentValue > sensor.maxThreshold;
            const isBelowMinThreshold = sensor.minThreshold && sensor.currentValue < sensor.minThreshold;

            if (isThresholdExceeded || isBelowMinThreshold) {
                // Verificar se já existe um alerta ativo para este sensor
                const existingAlert = await this.alertRepository.findOne({
                    where: {
                        sensorId: sensor.id,
                        status: AlertStatus.ACTIVE,
                    },
                });

                if (!existingAlert) {
                    const alertLevel = this.determineAlertLevel(sensor.type, sensor.currentValue, sensor.maxThreshold);
                    const alertDescription = this.generateAlertDescription(sensor, isThresholdExceeded);

                    await this.create({
                        title: `Alerta - ${sensor.name}`,
                        description: alertDescription,
                        level: alertLevel,
                        latitude: sensor.latitude,
                        longitude: sensor.longitude,
                        location: sensor.location,
                        sensorId: sensor.id,
                        triggerValue: sensor.currentValue,
                    });

                    alertsGenerated++;
                }
            }
        }

        if (alertsGenerated > 0) {
            console.log(`🔔 ${alertsGenerated} novos alertas gerados`);
        }
    }

    // Cron job para gerar alertas aleatórios (simulação) a cada 10 minutos
    @Cron(CronExpression.EVERY_SECOND)
    async generateRandomAlerts() {
        console.log('🎲 Gerando alertas aleatórios...');

        // 30% de chance de gerar um alerta aleatório
        if (Math.random() < 0.3) {
            const randomAlert = this.generateRandomAlert();
            await this.create(randomAlert);
            console.log(`🚨 Alerta aleatório gerado: ${randomAlert.title}`);
        }
    }

    private determineAlertLevel(sensorType: SensorType, currentValue: number, threshold: number): AlertLevel {
        const exceedPercentage = (currentValue / threshold) * 100;

        if (exceedPercentage >= 150) return AlertLevel.CRITICAL;
        if (exceedPercentage >= 125) return AlertLevel.HIGH;
        if (exceedPercentage >= 110) return AlertLevel.MEDIUM;
        return AlertLevel.LOW;
    }

    private generateAlertDescription(sensor: any, isAboveThreshold: boolean): string {
        const direction = isAboveThreshold ? 'acima' : 'abaixo';
        const threshold = isAboveThreshold ? sensor.maxThreshold : sensor.minThreshold;

        return `Sensor ${sensor.name} registrou valor ${direction} do limite estabelecido. ` +
            `Valor atual: ${sensor.currentValue}${sensor.unit}, Limite: ${threshold}${sensor.unit}. ` +
            `Localização: ${sensor.location}`;
    }

    private generateRandomAlert(): Partial<Alert> {
        const locations = [
            { name: 'Centro de São Paulo', lat: -23.5505, lng: -46.6333 },
            { name: 'Vila Madalena', lat: -23.5598, lng: -46.6890 },
            { name: 'Avenida Paulista', lat: -23.5613, lng: -46.6565 },
            { name: 'Parque Ibirapuera', lat: -23.5873, lng: -46.6578 },
            { name: 'Bairro da Liberdade', lat: -23.5587, lng: -46.6347 },
            { name: 'Marginal Tietê', lat: -23.5290, lng: -46.6658 },
        ];

        const alertTypes = [
            {
                title: 'Acidente de Trânsito',
                description: 'Acidente reportado envolvendo múltiplos veículos. Trânsito intenso na região.',
                level: AlertLevel.HIGH,
            },
            {
                title: 'Alagamento',
                description: 'Nível da água acima do normal devido às chuvas intensas.',
                level: AlertLevel.MEDIUM,
            },
            {
                title: 'Manifestação Pública',
                description: 'Concentração de pessoas reportada. Possível impacto no trânsito.',
                level: AlertLevel.LOW,
            },
            {
                title: 'Queda de Energia',
                description: 'Falha no fornecimento de energia elétrica na região.',
                level: AlertLevel.MEDIUM,
            },
            {
                title: 'Emergência Médica',
                description: 'Ocorrência médica reportada. Ambulâncias a caminho.',
                level: AlertLevel.CRITICAL,
            },
        ];

        const randomLocation = locations[Math.floor(Math.random() * locations.length)];
        const randomAlertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];

        return {
            title: randomAlertType.title,
            description: `${randomAlertType.description} Localização: ${randomLocation.name}`,
            level: randomAlertType.level,
            latitude: randomLocation.lat,
            longitude: randomLocation.lng,
            location: randomLocation.name,
        };
    }
}
