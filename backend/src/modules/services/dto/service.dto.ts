import { IsNotEmpty, IsArray, IsString, IsObject } from 'class-validator';

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
  };
}

export class UpdateServiceDto {
  @IsString()
  name?: string;

  @IsString()
  description?: string;

  @IsArray()
  images?: string[];

  @IsObject()
  openingHours?: {
    [key: string]: { open: string; close: string };
  };
}
