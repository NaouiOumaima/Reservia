// src/modules/reservations/dto/create-reservation.dto.ts

import {
  IsString,
  IsDateString,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class CreateReservationDto {
  @IsString()
  serviceId!: string;

  @IsDateString()
  startTime!: string;

  @IsNumber()
  @Min(5)
  @Max(480)
  duration!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ConfirmReservationDto {
  @IsString()
  reservationId!: string;
}

export class CancelReservationDto {
  @IsString()
  reservationId!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
