import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  RESERVATION_CONFIRMED = 'reservation_confirmed',
  RESERVATION_REMINDER = 'reservation_reminder',
  RESERVATION_CANCELLED = 'reservation_cancelled',
  RESERVATION_EXPIRED = 'reservation_expired',
  PROMOTION = 'promotion',
  ADVERTISEMENT = 'advertisement',
  SYSTEM = 'system',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId!: Types.ObjectId;

  @Prop({ required: true, enum: NotificationType })
  type!: NotificationType;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  message!: string;

  @Prop({ type: Types.ObjectId, ref: 'Reservation' })
  reservationId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Advertisement' })
  advertisementId?: Types.ObjectId;

  @Prop({ type: Object })
  data?: any;

  @Prop({ default: false })
  isRead!: boolean;

  @Prop({ type: [String], default: [] })
  channels?: string[];

  @Prop()
  imageUrl?: string;

  @Prop()
  actionUrl?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });