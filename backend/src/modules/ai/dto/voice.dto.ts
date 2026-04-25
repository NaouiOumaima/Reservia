// src/modules/ai/dto/voice.dto.ts
import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';

export enum VoiceLanguage {
  FR = 'fr-FR',
  EN = 'en-US',
  AR = 'ar-SA',
}

export enum VoiceGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export class SpeechToTextRequestDto {
  audio: any;

  @IsEnum(VoiceLanguage)
  @IsOptional()
  language?: VoiceLanguage;
}

export class SpeechToTextResponseDto {
  text: string;
  confidence: number;
  success: boolean;
}

export class TextToSpeechRequestDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsEnum(VoiceLanguage)
  @IsOptional()
  lang?: VoiceLanguage;

  @IsEnum(VoiceGender)
  @IsOptional()
  gender?: VoiceGender;
}

export class TextToSpeechResponseDto {
  audioUrl: string;
  duration: number;
  format: string;
}