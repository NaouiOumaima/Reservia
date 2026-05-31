// src/modules/reservations/dto/create-reservation.dto.ts
import { IsNotEmpty, IsString, IsOptional, IsNumber, Min, Max, IsDateString } from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty()
  serviceId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(50)
  numberOfPersons: number;

  @IsNotEmpty()
  @IsDateString()
  reservationDateTime: string;  // ✅ Date et heure exacte de la réservation

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ConfirmReservationDto {
  @IsNotEmpty()
  reservationId: string;
}

export class CancelReservationDto {
  @IsNotEmpty()
  reservationId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}