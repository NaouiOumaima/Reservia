// src/modules/websocket/websocket.module.ts
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  providers: [NotificationsGateway, JwtService, ConfigService],
  exports: [NotificationsGateway],
})
export class WebsocketModule {}