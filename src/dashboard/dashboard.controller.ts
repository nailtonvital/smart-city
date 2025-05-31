import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  async getOverview() {
    return this.dashboardService.getDashboardOverview();
  }

  @Get('map')
  async getMapData() {
    return this.dashboardService.getMapData();
  }

  @Get('analytics')
  async getAnalytics() {
    return this.dashboardService.getAnalytics();
  }
}
