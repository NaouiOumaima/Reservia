import { IsNotEmpty, IsDateString, IsString, IsOptional } from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty()
  serviceId: string;

  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @IsNotEmpty()
  @IsDateString()
  endTime: string;

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
