// backend/src/reviews/dto/review.dto.ts
import { IsOptional, IsString, IsInt, Min, Max, IsArray, IsIn } from 'class-validator';
import { Types } from 'mongoose';

export class CreateReviewDto {
  @IsOptional()
  serviceId?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  comment: string;

  @IsOptional()
  @IsArray()
  images?: string[];
}

export class ReportReviewDto {
  @IsString()
  @IsIn(['spam', 'offensive', 'fake', 'inappropriate', 'other'])
  reason: string;

  @IsOptional()
  @IsString()
  details?: string;
}

export class RespondToReviewDto {
  @IsString()
  text: string;
}