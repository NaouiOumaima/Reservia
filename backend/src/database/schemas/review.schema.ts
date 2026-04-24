// src/database/schemas/review.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  clientId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Service' })
  serviceId!: Types.ObjectId;

  @Prop({ required: true, min: 0, max: 5 })
  rating!: number;

  @Prop({ required: true })
  comment!: string;

  @Prop({ type: [String], default: [] })
  images?: string[];

  @Prop({ default: false })
  isApproved!: boolean;

  @Prop({ default: false })
  isReported!: boolean;

  @Prop()
  reportedReason?: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Index
ReviewSchema.index({ serviceId: 1, createdAt: -1 });
ReviewSchema.index({ clientId: 1 });
ReviewSchema.index({ isApproved: 1 });