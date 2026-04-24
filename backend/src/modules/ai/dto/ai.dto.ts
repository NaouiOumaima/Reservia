// src/modules/ai/dto/ai.dto.ts

export class ChatbotRequestDto {
  query!: string;
  userId?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export class ChatbotResponseDto {
  reply!: string;
  intent!: string;
  entities!: any;
}

export class SpeechToTextDto {
  audio!: Buffer;
}

export class TextToSpeechDto {
  text!: string;
  lang?: string;
}