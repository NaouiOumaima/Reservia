import { Controller, Get, Post, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async getMyNotifications(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    const onlyUnread = unreadOnly === 'true';
    
    return this.notificationsService.findByUserIdWithPagination(
      req.user._id,
      pageNum,
      limitNum,
      onlyUnread
    );
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

  @Delete(':id')
  async deleteNotification(@Param('id') id: string, @Request() req) {
    return this.notificationsService.deleteNotification(id, req.user._id);
  }

  @Delete('read/all')
  async deleteAllRead(@Request() req) {
    return this.notificationsService.deleteAllReadNotifications(req.user._id);
  }
}