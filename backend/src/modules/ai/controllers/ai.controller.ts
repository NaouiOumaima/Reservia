// src/modules/ai/controllers/ai.controller.ts
import { Controller, Post, Body, Get, Param, UseGuards, Request, UploadedFile, UseInterceptors, Headers } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from '../services/ai.service';
import { ChatbotRequestDto, ChatbotResponseDto } from '../dto/ai.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Public } from '../../../common/decorators/public.decorator';

@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  // ✅ ENDPOINT DE TEST - Public
  @Get('test')
  @Public()
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

  // ✅ CHATBOT - Public mais extrait le userId du token s'il existe
  @Post('chatbot')
  @Public()
  async chatbot(@Body() request: ChatbotRequestDto, @Headers('authorization') authHeader: string): Promise<ChatbotResponseDto> {
    console.log('📨 Chatbot request received:', request.query);
    console.log('SessionId reçu:', request.sessionId);  // ← Log pour déboguer
    
    // Extraire le userId du token JWT s'il est présent
    let userId = request.userId;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = this.decodeJWT(token);
        if (decoded && decoded.sub) {
          userId = decoded.sub;
          console.log('✅ Utilisateur authentifié:', userId);
        }
      } catch (e) {
        console.log('⚠️ Token invalide, utilisateur non authentifié');
      }
    }
    
    // Enrichir la requête avec le userId
    const enrichedRequest = {
      ...request,
      userId: userId,
    };
    
    // Appeler le service et récupérer la réponse
    const response = await this.aiService.chatbot(enrichedRequest);
    
    // 🔥 RETOURNER LE SESSIONID DANS LA RÉPONSE
    return {
      ...response,
      sessionId: request.sessionId || response.sessionId
    };
  }

  // ✅ SPEECH-TO-TEXT - Public
  @Post('speech-to-text')
  @Public()
  @UseInterceptors(FileInterceptor('audio'))
  async speechToText(@UploadedFile() file: any) {
    return { text: 'Fonctionnalité à implémenter' };
  }

  // ✅ TEXT-TO-SPEECH - Public
  @Post('text-to-speech')
  @Public()
  async textToSpeech(@Body('text') text: string, @Body('lang') lang?: string) {
    return { audioUrl: 'Fonctionnalité à implémenter' };
  }

  // ✅ RECOMMANDATIONS - Protégé (nécessite connexion)
  @Get('recommendations')
  @UseGuards(JwtAuthGuard)
  async getRecommendations(@Request() req) {
    const userId = req.user._id.toString();
    console.log('🔐 Recommendations request for user:', userId);
    return this.aiService.getRecommendations(userId);
  }

  // ==================== MÉTHODE PRIVÉE ====================
  
  /**
   * Décode un token JWT sans vérification de signature
   * (Utilisé uniquement pour extraire l'userId)
   */
  private decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }
}