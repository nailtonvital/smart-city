import { Injectable } from '@nestjs/common';
import { SensorService } from '../sensor/sensor.service';
import { AlertService } from '../alert/alert.service';
import { PopulationService } from '../population/population.service';

@Injectable()
export class DashboardService {
  constructor(
    private sensorService: SensorService,
    private alertService: AlertService,
    private populationService: PopulationService,
  ) {}

  async getDashboardOverview() {
    const [sensors, activeAlerts, populationStats] = await Promise.all([
      this.sensorService.findAll(),
      this.alertService.findActive(),
      this.populationService.getStatistics(),
    ]);

    const activeSensors = sensors.filter(s => s.status === 'active').length;
    const criticalAlerts = activeAlerts.filter(a => a.level === 'critical').length;
    const highAlerts = activeAlerts.filter(a => a.level === 'high').length;

    return {
      overview: {
        totalSensors: sensors.length,
        activeSensors,
        totalAlerts: activeAlerts.length,
        criticalAlerts,
        highAlerts,
        pendingReports: populationStats.byStatus.pending,
        totalReports: populationStats.total,
      },
      sensors: sensors.map(sensor => ({
        id: sensor.id,
        name: sensor.name,
        type: sensor.type,
        status: sensor.status,
        currentValue: sensor.currentValue,
        unit: sensor.unit,
        location: sensor.location,
        latitude: sensor.latitude,
        longitude: sensor.longitude,
        lastReading: sensor.lastReading,
      })),
      alerts: activeAlerts.map(alert => ({
        id: alert.id,
        title: alert.title,
        level: alert.level,
        location: alert.location,
        latitude: alert.latitude,
        longitude: alert.longitude,
        createdAt: alert.createdAt,
        sensorName: alert.sensor?.name,
      })),
      populationReports: populationStats,
    };
  }

  async getMapData() {
    const [sensors, alerts, reports] = await Promise.all([
      this.sensorService.findAll(),
      this.alertService.findActive(),
      this.populationService.findByStatus('pending' as any),
    ]);

    return {
      sensors: sensors.map(sensor => ({
        id: sensor.id,
        name: sensor.name,
        type: sensor.type,
        status: sensor.status,
        latitude: sensor.latitude,
        longitude: sensor.longitude,
        currentValue: sensor.currentValue,
        unit: sensor.unit,
      })),
      alerts: alerts.map(alert => ({
        id: alert.id,
        title: alert.title,
        level: alert.level,
        latitude: alert.latitude,
        longitude: alert.longitude,
        createdAt: alert.createdAt,
      })),
      reports: reports.map(report => ({
        id: report.id,
        title: report.title,
        type: report.type,
        priority: report.priority,
        latitude: report.latitude,
        longitude: report.longitude,
        createdAt: report.createdAt,
      })),
    };
  }

  async getAnalytics() {
    const [sensors, allAlerts, populationStats] = await Promise.all([
      this.sensorService.findAll(),
      this.alertService.findAll(),
      this.populationService.getStatistics(),
    ]);

    // Análise de sensores por tipo
    const sensorsByType = sensors.reduce((acc, sensor) => {
      acc[sensor.type] = (acc[sensor.type] || 0) + 1;
      return acc;
    }, {});

    // Análise de alertas por nível
    const alertsByLevel = allAlerts.reduce((acc, alert) => {
      acc[alert.level] = (acc[alert.level] || 0) + 1;
      return acc;
    }, {});

    // Análise temporal de alertas (últimos 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentAlerts = allAlerts.filter(alert => alert.createdAt >= sevenDaysAgo);
    const alertsByDay = recentAlerts.reduce((acc, alert) => {
      const day = alert.createdAt.toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    return {
      sensors: {
        total: sensors.length,
        byType: sensorsByType,
        byStatus: sensors.reduce((acc, sensor) => {
          acc[sensor.status] = (acc[sensor.status] || 0) + 1;
          return acc;
        }, {}),
      },
      alerts: {
        total: allAlerts.length,
        byLevel: alertsByLevel,
        recent: recentAlerts.length,
        byDay: alertsByDay,
      },
      population: populationStats,
    };
  }
}
