import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  serviceId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class UpdateReviewDto {
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsString()
  comment?: string;
}

export class ReportReviewDto {
  @IsNotEmpty()
  reviewId: string;

  @IsNotEmpty()
  @IsString()
  reason: string;
}
