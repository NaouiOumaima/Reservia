// src/modules/services/dto/upsert-location.dto.ts

import { IsString, IsNotEmpty, ValidateNested, IsOptional, IsNumber, IsLatitude, IsLongitude } from 'class-validator';
import { Type } from 'class-transformer';

class LocationCoordinatesDto {
  @IsNumber()
  @IsLongitude()
  lng: number;

  @IsNumber()
  @IsLatitude()
  lat: number;
}

class LocationDataDto {
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

export class UpsertLocationDto {
  @ValidateNested()
  @Type(() => LocationDataDto)
  location: LocationDataDto;
}