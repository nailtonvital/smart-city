import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHome(): object {
    return {
      message: 'Smart City API - Plataforma Colaborativa',
      version: '1.0.0',
      description: 'Sistema de monitoramento inteligente com sensores, alertas e reportes da população',
      endpoints: {
        dashboard: {
          overview: '/dashboard/overview',
          map: '/dashboard/map',
          analytics: '/dashboard/analytics',
        },
        sensors: {
          list: '/sensors',
          nearby: '/sensors/nearby?lat=-23.5505&lng=-46.6333&radius=5',
          initialize: '/sensors/initialize',
        },
        alerts: {
          list: '/alerts',
          active: '/alerts/active',
        },
        population: {
          reports: '/population/reports',
          byStatus: '/population/reports/status/pending',
          statistics: '/population/reports/statistics',
        },
      },
      features: [
        '🌡️ Monitoramento de sensores em tempo real',
        '🚨 Sistema de alertas automático',
        '👥 Reportes colaborativos da população',
        '📊 Dashboard com analytics',
        '🗺️ Visualização em mapa',
        '⏰ Cron jobs para simulação de dados',
      ],
    };
  }

  @Get('health')
  getHealth(): object {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
