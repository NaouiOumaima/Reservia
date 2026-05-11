import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, Max, IsIn } from 'class-validator';

export class CreateReviewDto {
  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsNotEmpty()
  @IsString()
  comment: string;

  @IsOptional()
  images?: string[];

  // Type d'avis: 'service' ou 'app'
  @IsOptional()
  @IsIn(['service', 'app'])
  type?: 'service' | 'app';
}

export class ReportReviewDto {
  @IsNotEmpty()
  @IsIn(['spam', 'offensive', 'fake', 'inappropriate', 'other'])
  reason: string;

  @IsOptional()
  @IsString()
  details?: string;
}

export class RespondToReviewDto {
  @IsNotEmpty()
  @IsString()
  response: string;
}