import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  userEmail: string;

  // Type d'avis: 'service' ou 'app'
  @Prop({ required: true, enum: ['service', 'app'], default: 'service' })
  reviewType: string;

  // Pour les avis sur service (optionnel)
  @Prop({ type: Types.ObjectId, ref: 'Service' })
  serviceId: Types.ObjectId;

  @Prop()
  serviceName: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  serviceProviderId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true })
  comment: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: false })
  isReported: boolean;

  @Prop({ type: String, enum: ['spam', 'offensive', 'fake', 'inappropriate', 'other'] })
  reportReason: string;

  @Prop()
  reportDetails: string;

  @Prop()
  reportedAt: Date;

  @Prop({ default: true })
  isApproved: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  deletedAt: Date;

  @Prop({ default: 0 })
  helpful: number;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Indexes
ReviewSchema.index({ serviceId: 1, createdAt: -1 });
ReviewSchema.index({ reviewType: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1, serviceId: 1 }, { unique: true, partialFilterExpression: { serviceId: { $exists: true } } });
ReviewSchema.index({ isReported: 1, reportedAt: -1 });