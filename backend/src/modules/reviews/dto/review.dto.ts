import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  Min,
  Max,
  IsIn,
  MaxLength,
} from 'class-validator';

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

  // Nom affiché pour un avis "app" laissé sans compte (visiteur)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  guestName?: string;
}

export class UpdateReviewDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  images?: string[];
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
