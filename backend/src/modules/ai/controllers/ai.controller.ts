// src/modules/ai/controllers/ai.controller.ts
import { Controller, Post, Body, Get, Param, UseGuards, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from '../services/ai.service';
import { ChatbotRequestDto } from '../dto/ai.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  // 🆕 ENDPOINT DE TEST - Ajoutez ceci en premier
  @Get('test')
  async test() {
    return {
      status: 'ok',
      message: 'Chatbot API is working!',
      timestamp: new Date().toISOString(),
      endpoints: {
        chatbot: 'POST /api/ai/chatbot',
        test: 'GET /api/ai/test'
      }
    };
  }

  @Post('chatbot')
  async chatbot(@Body() request: ChatbotRequestDto) {
    console.log('📨 Chatbot request received:', request.query);
    return this.aiService.chatbot(request);
  }

  @Post('speech-to-text')
  @UseInterceptors(FileInterceptor('audio'))
  async speechToText(@UploadedFile() file: any) {
    return { text: 'Fonctionnalité à implémenter' };
  }

  @Post('text-to-speech')
  async textToSpeech(@Body('text') text: string, @Body('lang') lang?: string) {
    return { audioUrl: 'Fonctionnalité à implémenter' };
  }

  @Get('recommendations')
  @UseGuards(JwtAuthGuard)
  async getRecommendations(@Request() req) {
    return this.aiService.getRecommendations(req.user._id);
  }
}