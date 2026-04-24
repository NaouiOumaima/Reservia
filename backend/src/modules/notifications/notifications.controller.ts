// src/modules/notifications/notifications.controller.ts

import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async getMyNotifications(@Request() req) {
    return this.notificationsService.findByUserId(req.user._id);
  }

  @Get('unread')
  async getUnread(@Request() req) {
    return this.notificationsService.findByUserId(req.user._id, true);
  }

  @Get('unread/count')
  async getUnreadCount(@Request() req) {
    const count = await this.notificationsService.getUnreadCount(req.user._id);
    return { count };
  }

  @Post(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user._id);
  }

  @Post('read-all')
  async markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user._id);
  }
}