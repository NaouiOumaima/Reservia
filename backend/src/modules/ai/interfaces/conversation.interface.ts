// src/modules/ai/interfaces/conversation.interface.ts
export interface IConversationContext {
  sessionId: string;
  userId?: string;
  lastIntent: string;
  lastEntities: Record<string, any>;
  step: ConversationStep;
  tempData: Record<string, any>;
  messageHistory: IMessage[];
  timestamp: Date;
  expiresAt: Date;
}

export enum ConversationStep {
  IDLE = 'idle',
  SEARCHING = 'searching',
  BOOKING = 'booking',
  CANCELLING = 'cancelling',
  HELP = 'help',
  FEEDBACK = 'feedback',
}

export interface IMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  intent?: string;
  entities?: any;
  timestamp: Date;
}

export interface IIntentStrategy {
  matches(text: string): boolean;
  execute(text: string, context: IConversationContext): Promise<ChatbotResponseDto>;
}

import { ChatbotResponseDto } from '../dto/ai.dto';