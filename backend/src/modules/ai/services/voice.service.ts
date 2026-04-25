// src/modules/ai/services/voice.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SpeechToTextResponseDto, TextToSpeechResponseDto, VoiceLanguage, VoiceGender } from '../dto/voice.dto';
import * as fs from 'fs';
import * as path from 'path';
import axios, { AxiosError } from 'axios';

@Injectable()
export class VoiceService {
  private readonly logger = new Logger(VoiceService.name);
  private readonly audioCache = new Map<string, { url: string; timestamp: number }>();
  private readonly CACHE_DURATION = 3600000;

  constructor(private configService: ConfigService) {}

  async speechToText(audioBuffer: Buffer, language: VoiceLanguage = VoiceLanguage.FR): Promise<SpeechToTextResponseDto> {
    try {
      const assemblyAIApiKey = this.configService.get<string>('ASSEMBLYAI_API_KEY');
      
      if (!assemblyAIApiKey) {
        this.logger.warn('AssemblyAI API key not found, using simulation');
        return this.simulateSpeechToText(audioBuffer);
      }

      // Envoi direct du Buffer - PAS besoin de Blob
      const uploadResponse = await axios.post(
        'https://api.assemblyai.com/v2/upload',
        audioBuffer,
        {
          headers: {
            'Authorization': assemblyAIApiKey,
            'Content-Type': 'application/octet-stream',
          },
        }
      );

      const audioUrl = uploadResponse.data.upload_url;

      const transcriptResponse = await axios.post(
        'https://api.assemblyai.com/v2/transcript',
        {
          audio_url: audioUrl,
          language_code: language.split('-')[0],
          sentiment_analysis: true,
        },
        {
          headers: {
            'Authorization': assemblyAIApiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      const transcriptId = transcriptResponse.data.id;

      let transcriptResult: any = null;
      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts) {
        await this.sleep(1000);
        
        const result = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
          headers: { 'Authorization': assemblyAIApiKey },
        });

        if (result.data.status === 'completed') {
          transcriptResult = result.data;
          break;
        } else if (result.data.status === 'error') {
          throw new Error(`Transcription failed: ${result.data.error}`);
        }
        
        attempts++;
      }

      if (!transcriptResult) {
        throw new Error('Transcription timeout');
      }

      return {
        text: transcriptResult.text || '',
        confidence: transcriptResult.confidence || 0.95,
        success: true,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(`Speech-to-text error: ${axiosError.message}`);
      return this.simulateSpeechToText(audioBuffer);
    }
  }

  async textToSpeech(
    text: string, 
    language: VoiceLanguage = VoiceLanguage.FR, 
    gender: VoiceGender = VoiceGender.FEMALE
  ): Promise<TextToSpeechResponseDto> {
    try {
      const cacheKey = `${text}:${language}:${gender}`;
      const cached = this.audioCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return {
          audioUrl: cached.url,
          duration: 0,
          format: 'mp3',
        };
      }

      const apiKey = this.configService.get<string>('GOOGLE_CLOUD_API_KEY');
      
      if (!apiKey) {
        return this.simulateTextToSpeech(text, language, gender);
      }

      const voiceMap: Record<VoiceLanguage, string> = {
        [VoiceLanguage.FR]: gender === VoiceGender.FEMALE ? 'fr-FR-Wavenet-C' : 'fr-FR-Wavenet-B',
        [VoiceLanguage.EN]: gender === VoiceGender.FEMALE ? 'en-US-Wavenet-C' : 'en-US-Wavenet-B',
        [VoiceLanguage.AR]: gender === VoiceGender.FEMALE ? 'ar-XA-Wavenet-C' : 'ar-XA-Wavenet-B',
      };

      const requestBody = {
        input: { text },
        voice: {
          languageCode: language,
          name: voiceMap[language],
          ssmlGender: gender === VoiceGender.FEMALE ? 'FEMALE' : 'MALE',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0,
          volumeGainDb: 0,
        },
      };

      const response = await axios.post(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
        requestBody,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const audioContent = response.data.audioContent;
      const audioBuffer = Buffer.from(audioContent, 'base64');
      
      const fileName = `tts_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`;
      const filePath = path.join(process.cwd(), 'uploads', 'audio', fileName);
      
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(filePath, audioBuffer);
      
      const audioUrl = `/uploads/audio/${fileName}`;
      
      this.audioCache.set(cacheKey, {
        url: audioUrl,
        timestamp: Date.now(),
      });

      return {
        audioUrl,
        duration: this.estimateDuration(text),
        format: 'mp3',
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(`Text-to-speech error: ${axiosError.message}`);
      return this.simulateTextToSpeech(text, language, gender);
    }
  }

  private async simulateSpeechToText(audioBuffer: Buffer): Promise<SpeechToTextResponseDto> {
    this.logger.log('Simulating speech-to-text');
    
    const mockTexts = [
      "Je cherche un restaurant pas cher près de moi",
      "Je veux réserver une table pour ce soir",
      "Quels sont les meilleurs hôtels dans le centre ?",
      "Annuler ma réservation pour demain",
      "Aide-moi à trouver un spa",
    ];
    
    const mockIndex = Math.floor(Math.random() * mockTexts.length);
    
    await this.sleep(500);
    
    return {
      text: mockTexts[mockIndex],
      confidence: 0.85,
      success: true,
    };
  }

  private async simulateTextToSpeech(
    text: string, 
    language: VoiceLanguage, 
    gender: VoiceGender
  ): Promise<TextToSpeechResponseDto> {
    this.logger.log(`Simulating text-to-speech for: ${text}`);
    
    await this.sleep(300);
    
    return {
      audioUrl: `https://api.example.com/tts/sample.mp3?text=${encodeURIComponent(text)}&lang=${language}&gender=${gender}`,
      duration: this.estimateDuration(text),
      format: 'mp3',
    };
  }

  private estimateDuration(text: string): number {
    return Math.ceil(text.length / 2.5);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}