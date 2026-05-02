import { IsNumber, IsString, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class LocationCoordinatesDto {
  @IsNumber()
  lng: number;

  @IsNumber()
  lat: number;
}

class LocationDataDto {
  @ValidateNested()
  @Type(() => LocationCoordinatesDto)
  coordinates: LocationCoordinatesDto;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
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