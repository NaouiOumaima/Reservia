// backend/src/database/schemas/advertisement.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// ✅ Définir l'interface complète
export interface AdvertisementDocument extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  imageUrl: string;
  providerId: Types.ObjectId;
  providerName: string;
  discountCode?: string;
  discountPercentage?: number;
  validUntil?: Date;
  status: string;
  targetAudience: string;
  targetCategory?: string;
  targetCity?: string;
  viewsCount: number;
  clicksCount: number;
  viewedBy: Array<{ userId: string; viewedAt: Date }>;
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ timestamps: true })
export class Advertisement {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  imageUrl!: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  providerId!: Types.ObjectId;

  @Prop({ required: true })
  providerName!: string;

  @Prop()
  discountCode?: string;

  @Prop({ min: 0, max: 100 })
  discountPercentage?: number;

  @Prop()
  validUntil?: Date;

  @Prop({ default: 'active' })
  status!: string;

  @Prop({ default: 'all' })
  targetAudience!: string;

  @Prop()
  targetCategory?: string;

  @Prop()
  targetCity?: string;

  @Prop({ default: 0 })
  viewsCount!: number;

  @Prop({ default: 0 })
  clicksCount!: number;

  @Prop({ type: [{ userId: String, viewedAt: Date }], default: [] })
  viewedBy!: Array<{ userId: string; viewedAt: Date }>;
}

export const AdvertisementSchema = SchemaFactory.createForClass(Advertisement);