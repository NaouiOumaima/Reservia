// src/database/schemas/reservation.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReservationDocument = Reservation & Document;

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  clientId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Service' })
  serviceId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  providerId!: Types.ObjectId;

  @Prop({ required: true, default: 1, min: 1 })
  numberOfPersons!: number;

  @Prop({ required: true })
  reservationDateTime!: Date;  // ✅ Date et heure exacte

  @Prop({ required: true, default: 0 })
  price!: number;  // Prix calculé ou défini par le service

  @Prop({ required: true, enum: ReservationStatus, default: ReservationStatus.PENDING })
  status!: ReservationStatus;

  @Prop()
  notes?: string;

  @Prop({ type: Types.ObjectId, ref: 'Review' })
  reviewId?: Types.ObjectId;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop()
  cancelledAt?: Date;

  @Prop()
  cancellationReason?: string;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);

ReservationSchema.index({ clientId: 1, createdAt: -1 });
ReservationSchema.index({ serviceId: 1, status: 1 });
ReservationSchema.index({ expiresAt: 1 });
ReservationSchema.index({ reservationDateTime: 1 }); // Pour les recherches par date