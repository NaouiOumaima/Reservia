// src/database/schemas/service.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ServiceDocument = Service & Document;

export enum ServiceCategory {
  RESTAURANT = 'restaurant',
  HOTEL = 'hotel',
  GYM = 'gym',
  SALON = 'salon',
  SPA = 'spa',
  REPAIR = 'repair',
  MEDICAL = 'medical',
  EDUCATION = 'education',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class Service {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  providerId!: Types.ObjectId;

  @Prop({ required: true, enum: ServiceCategory })
  category!: ServiceCategory;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  basePrice!: number;

  @Prop()
  discountPrice?: number;

  @Prop({ required: true })
  duration!: number;

  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop({ required: true, type: Object })
  location!: {
    type: string;
    coordinates: [number, number];
    address: string;
    city: string;
    governorate: string;
    postalCode?: string;
  };

  @Prop({ default: 0 })
  avgRating!: number;

  @Prop({ default: 0 })
  reviewCount!: number;

  @Prop({ default: 0 })
  popularity!: number;

  @Prop({ default: 0 })
  smartScore!: number;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: Object })
  cancellationPolicy?: {
    minHoursBefore: number;
    refundPercentage: number;
  };

  @Prop({ type: [{ start: String, end: String }], default: [] })
  unavailableSlots?: Array<{ start: string; end: string }>;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);

// Index pour la recherche
ServiceSchema.index({ location: '2dsphere' });
ServiceSchema.index({ name: 'text', description: 'text' });
ServiceSchema.index({ category: 1 });
ServiceSchema.index({ smartScore: -1 });
ServiceSchema.index({ providerId: 1 });