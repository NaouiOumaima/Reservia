// src/modules/services/dto/create-service.dto.ts

import { IsString, IsNumber, IsOptional, IsArray, IsEnum, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceCategory } from '../../../database/schemas/service.schema';

class LocationDto {
  @IsArray()
  coordinates!: [number, number];

  @IsString()
  address!: string;

  @IsString()
  city!: string;

  @IsString()
  governorate!: string;

  @IsOptional()
  @IsString()
  postalCode?: string;
}

export class CreateServiceDto {
  @IsString()
  name!: string;

  @IsEnum(ServiceCategory)
  category!: ServiceCategory;

  @IsString()
  description!: string;

  @IsNumber()
  @Min(0)
  basePrice!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPrice?: number;

  @IsNumber()
  @Min(5)
  @Max(480)
  duration!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ValidateNested()
  @Type(() => LocationDto)
  location!: LocationDto;
}