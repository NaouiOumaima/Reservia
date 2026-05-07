import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  CLIENT = 'client',
  PROVIDER = 'provider',
  ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email!: string;

  // ✅ required: false — les comptes Google n'ont pas de mot de passe
  @Prop({ required: false, default: '' })
  password!: string;

  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.CLIENT })
  role!: UserRole;

  @Prop()
  phone?: string;

  @Prop()
  profileImage?: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: false })
  isBanned!: boolean;

  @Prop()
  lastLogin?: Date;

  @Prop({ default: false })
  isEmailVerified!: boolean;

  @Prop()
  emailVerificationToken?: string;

  @Prop()
  emailVerificationExpires?: Date;

  @Prop({ default: 'active' })
  providerStatus!: string;

  // ✅ Champs Google OAuth
  @Prop({ default: null })
  googleId: string | null;

  @Prop({ default: null })
  picture: string | null;

  @Prop({ type: Object })
  preferences?: {
    favoriteCategories?: string[];
    maxPrice?: number;
    maxDistance?: number;
    preferredDays?: string[];
    preferredHours?: string;
  };

  @Prop({ type: Object })
  providerProfile?: {
    businessName: string;
    siret?: string;
    description: string;
    images: string[];
    openingHours: Record<string, any>;
    settings: {
      slotDuration: number;
      cancellationDeadline: number;
      maxAdvanceBooking: number;
      prepareTime: number;
    };
    isVerified: boolean;
  };

  @Prop({ type: Object })
  location?: {
    type: string;
    coordinates: [number, number];
    address: string;
    city: string;
    governorate: string;
    postalCode?: string;
  };

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Service' }] })
  favoriteServices?: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Reservation' }] })
  reservations?: Types.ObjectId[];

  @Prop({ default: null })
  refreshToken: string | null;

  @Prop({ default: 0 })
  failedLoginAttempts: number;

  @Prop()
  lockUntil: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ location: '2dsphere' });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isBanned: 1 });