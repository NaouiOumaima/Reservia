import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

// JwtService est fourni globalement par le JwtModule enregistré dans
// AppModule (global: true) — inutile de le réenregistrer ici.
@Module({
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class WebsocketModule {}
