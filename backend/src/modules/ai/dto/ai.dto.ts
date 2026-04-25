// src/modules/ai/dto/ai.dto.ts
import { IsString, IsOptional, IsObject, IsNumber, IsNotEmpty, Min, Max } from 'class-validator';

export class LocationDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;
}

export class ChatbotRequestDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsObject()
  location?: LocationDto;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  language?: string;
}

export class ChatbotResponseDto {
  reply: string;
  intent: string;
  entities: any;
  suggestedActions?: string[];
  data?: any;
}

export class IntentRequestDto {
  @IsString()
  text: string;

  @IsOptional()
  context?: any;
}

export class IntentResponseDto {
  intent: string;
  confidence: number;
  entities: any;
  sentiment: 'positive' | 'negative' | 'neutral';
}