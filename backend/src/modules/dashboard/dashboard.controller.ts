// src/modules/dashboard/dashboard.controller.ts
import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { DashboardService, ServiceStats, HourlyHeatmapData, TrendData, HomePageStats } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  // ✅ IMPORTANT: Cet endpoint doit être PUBLIC (sans @UseGuards)
  @Get('stats/home')
  async getHomePageStats(): Promise<HomePageStats> {
    console.log('📊 Home stats endpoint called');
    try {
      const stats = await this.dashboardService.getHomePageStats();
      console.log('📊 Stats retrieved:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error in getHomePageStats:', error);
      throw error;
    }
  }

  // Endpoints protégés pour les providers
  @Get('provider')
  @UseGuards(JwtAuthGuard)
  async getProviderDashboard(@Request() req, @Query('period') period: 'day' | 'week' | 'month' = 'month') {
    return this.dashboardService.getProviderDashboard(req.user._id, period);
  }

  @Get('provider/services')
  @UseGuards(JwtAuthGuard)
  async getServiceStats(@Request() req): Promise<ServiceStats[]> {
    return this.dashboardService.getServiceStats(req.user._id);
  }

  @Get('provider/heatmap')
  @UseGuards(JwtAuthGuard)
  async getHourlyHeatmap(@Request() req): Promise<HourlyHeatmapData[]> {
    return this.dashboardService.getHourlyHeatmap(req.user._id);
  }

  @Get('provider/trends')
  @UseGuards(JwtAuthGuard)
  async getTrends(@Request() req): Promise<TrendData[]> {
    return this.dashboardService.getTrends(req.user._id);
  }
}