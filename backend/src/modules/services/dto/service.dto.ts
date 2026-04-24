import { IsNotEmpty, IsNumber, IsArray, IsString, IsObject, Min, Max } from 'class-validator';

export class CreateServiceDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  basePrice: number;

  @IsArray()
  images?: string[];

  @IsNotEmpty()
  @IsObject()
  location: {
    type: 'Point';
    coordinates: [number, number];
  };

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsObject()
  openingHours: {
    [key: string]: { open: string; close: string };
  };

  @IsArray()
  slots: {
    duration: number;
    maxReservationsPerSlot: number;
  }[];

  @IsObject()
  cancellationPolicy: {
    minHoursBefore: number;
    refundPercentage: number;
  };
}

export class UpdateServiceDto {
  @IsString()
  name?: string;

  @IsString()
  description?: string;

  @IsNumber()
  basePrice?: number;

  @IsArray()
  images?: string[];

  @IsObject()
  openingHours?: {
    [key: string]: { open: string; close: string };
  };
}
