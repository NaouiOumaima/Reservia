// backend/src/modules/admin/admin.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  async getStats(@Query('timeRange') timeRange: 'week' | 'month' | 'year' = 'month') {
    return this.adminService.getStats(timeRange);
  }
}