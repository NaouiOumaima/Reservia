// src/modules/ai/ai.controller.ts

import { Controller, Post, Body, Get, Param, UseGuards, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';
import { ChatbotRequestDto } from './dto/ai.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('chatbot')
  async chatbot(@Body() request: ChatbotRequestDto) {
    return this.aiService.chatbot(request);
  }

  @Post('speech-to-text')
  @UseInterceptors(FileInterceptor('audio'))
  async speechToText(@UploadedFile() file: any) {
    // TODO: Intégrer AssemblyAI ou autre API
    return { text: 'Fonctionnalité à implémenter' };
  }

  @Post('text-to-speech')
  async textToSpeech(@Body('text') text: string, @Body('lang') lang?: string) {
    // TODO: Intégrer API de synthèse vocale
    return { audioUrl: 'Fonctionnalité à implémenter' };
  }

  @Get('recommendations')
  @UseGuards(JwtAuthGuard)
  async getRecommendations(@Request() req) {
    return this.aiService.getRecommendations(req.user._id);
  }
}