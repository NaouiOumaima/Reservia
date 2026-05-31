// src/modules/services/dto/create-service.dto.ts

import { 
  IsNotEmpty, 
  IsArray, 
  IsString, 
  IsObject, 
  IsOptional, 
  ValidateNested, 
  IsNumber, 
  Min,
  Max,
  IsLatitude,
  IsLongitude
} from 'class-validator';
import { Type } from 'class-transformer';

class LocationCoordinatesDto {
  @IsNumber()
  @IsLongitude()
  lng: number;

  @IsNumber()
  @IsLatitude()
  lat: number;
}

class LocationDto {
  @IsOptional()
  @IsString()
  type?: 'Point';

  @ValidateNested()
  @Type(() => LocationCoordinatesDto)
  coordinates: LocationCoordinatesDto;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  governorate: string;

  @IsOptional()
  @IsString()
  postalCode?: string;
}

class OpeningHoursSlotDto {
  @IsString()
  @IsNotEmpty()
  open: string;

  @IsString()
  @IsNotEmpty()
  close: string;
}

class ServiceSlotDto {
  @IsNumber()
  @Min(15)
  duration: number;

  @IsNumber()
  @Min(1)
  maxReservationsPerSlot: number;
}

class CancellationPolicyDto {
  @IsNumber()
  @Min(0)
  minHoursBefore: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  refundPercentage: number;
}

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  category: string;  // ✅ Simple string, validation seulement présence

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  @IsObject()
  openingHours?: {
    [key: string]: OpeningHoursSlotDto;
  };

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceSlotDto)
  slots?: ServiceSlotDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CancellationPolicyDto)
  cancellationPolicy?: CancellationPolicyDto;

  @IsOptional()
  @IsNumber()
  @Min(15)
  duration?: number;
}