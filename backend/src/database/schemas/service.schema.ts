// src/modules/services/schemas/service.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ServiceDocument = Service & Document;

@Schema({ timestamps: true })
export class Service extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })  // ✅ Simple string, pas d'enum
  category: string;

  // ❌ PAS de basePrice - service GRATUIT

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      required: false,
    },
    coordinates: {
      type: [Number],
      required: false,
      index: '2dsphere',
    },
    address: { type: String, required: false },
    city: { type: String, required: false },
    governorate: { type: String, required: false },
    postalCode: { type: String },
  })
  location?: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
    city: string;
    governorate: string;
    postalCode?: string;
  };

  @Prop({ type: Object, default: {} })
  openingHours: {
    [key: string]: { open: string; close: string };
  };

  @Prop({ type: [{ duration: Number, maxReservationsPerSlot: Number }], default: [] })
  slots: {
    duration: number;
    maxReservationsPerSlot: number;
  }[];

  @Prop({ type: Object })
  cancellationPolicy: {
    minHoursBefore: number;
    refundPercentage: number;
  };

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  providerId: Types.ObjectId;

  @Prop({ default: false })  // ✅ Par défaut désactivé jusqu'à approbation admin
  isActive: boolean;

  @Prop({ default: true })   // ✅ En attente d'approbation par défaut
  isPendingApproval: boolean;

  @Prop({ default: 0 })
  popularity: number;

  @Prop({ default: 0 })
  smartScore: number;

  @Prop({ default: 0 })
  avgRating: number;

  @Prop({ default: 0 })
  reviewCount: number;

  @Prop({ type: String })
  rejectionReason?: string;

  @Prop({ default: 60 })
  duration: number;

   @Prop({ default: false })
  isBanned: boolean;

  @Prop({ type: String })
  banReason?: string;

  @Prop({ type: Date })
  bannedAt?: Date;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);

// Index géospatial
ServiceSchema.index({ location: '2dsphere' });
ServiceSchema.index({ providerId: 1 });
ServiceSchema.index({ category: 1 });
ServiceSchema.index({ isActive: 1, isPendingApproval: 1 });