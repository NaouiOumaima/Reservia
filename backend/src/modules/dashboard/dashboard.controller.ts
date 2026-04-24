// src/modules/dashboard/dashboard.controller.ts

import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { DashboardService, ServiceStats, HourlyHeatmapData, TrendData } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('provider')
  async getProviderDashboard(@Request() req, @Query('period') period: 'day' | 'week' | 'month' = 'month') {
    return this.dashboardService.getProviderDashboard(req.user._id, period);
  }

  @Get('provider/services')
  async getServiceStats(@Request() req): Promise<ServiceStats[]> {
    return this.dashboardService.getServiceStats(req.user._id);
  }

  @Get('provider/heatmap')
  async getHourlyHeatmap(@Request() req): Promise<HourlyHeatmapData[]> {
    return this.dashboardService.getHourlyHeatmap(req.user._id);
  }

  @Get('provider/trends')
  async getTrends(@Request() req): Promise<TrendData[]> {
    return this.dashboardService.getTrends(req.user._id);
  }
}
