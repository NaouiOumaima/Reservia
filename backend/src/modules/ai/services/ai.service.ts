// src/modules/ai/services/ai.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, ServiceDocument } from '../../../database/schemas/service.schema';
import { Reservation, ReservationDocument } from '../../../database/schemas/reservation.schema';
import { ChatbotRequestDto, ChatbotResponseDto } from '../dto/ai.dto';
import { NlpService } from './nlp.service';
import { RecommendationService } from './recommendation.service';
import { EmailService } from '../../email/email.service';
import { Language, LOCALIZED_RESPONSES } from './constants/language.constants';

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error occurred';
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Returns a localized string from LOCALIZED_RESPONSES.
 * If the value is an array, a random element is returned.
 */
function t(key: string, lang: Language): string {
  const entry = LOCALIZED_RESPONSES[key];
  if (!entry) return '';
  const value = entry[lang] ?? entry['fr'] ?? '';
  if (Array.isArray(value)) return value[Math.floor(Math.random() * value.length)];
  return value as string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONVERSATION CONTEXT
// ─────────────────────────────────────────────────────────────────────────────

interface ConversationContext {
  sessionId: string;
  userId?: string;
  detectedLang: Language;
  lastIntent: string;
  lastEntities: any;
  step: 'idle' | 'searching' | 'booking' | 'cancelling' | 'help';
  tempData: any;
  messageHistory: Array<{ role: string; content: string; timestamp: Date }>;
  timestamp: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// AI SERVICE
// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly contexts = new Map<string, ConversationContext>();
  private readonly rateLimits = new Map<string, number[]>();

  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    @InjectModel('User') private userModel: Model<any>,
    private nlpService: NlpService,
    private recommendationService: RecommendationService,
    private emailService: EmailService,
  ) {}

  // ── MAIN ENTRY POINT ──────────────────────────────────────────────────────
  async chatbot(request: ChatbotRequestDto): Promise<ChatbotResponseDto> {
    try {
      // 1. Analyze intent and detect language
      const intentAnalysis = await this.nlpService.analyzeIntent(request.query);
      const entities = intentAnalysis.entities;
      const lang: Language = (entities.detectedLang as Language) || 'fr';

      this.logger.log(
        `[Chatbot] lang=${lang} | intent=${intentAnalysis.intent} | ` +
        `query="${request.query.substring(0, 60)}"`
      );

      // 2. Rate limiting
      if (request.userId && !this.checkRateLimit(request.userId)) {
        return { reply: t('rate_limited', lang), intent: 'rate_limited', entities: {} };
      }

      // 3. Session context
      const sessionId = request.sessionId || this.generateSessionId();
      const context = this.getContext(sessionId);
      context.userId = request.userId;
      context.detectedLang = lang; // update language in context

      // 4. Intent routing
      const intent = intentAnalysis.intent !== 'unknown'
        ? intentAnalysis.intent
        : this.fallbackIntentDetection(request.query);

      let response: ChatbotResponseDto;

      switch (intent) {
        case 'search':
          response = await this.handleSearchIntent(
            request.query, request.location, entities, lang
          );
          break;
        case 'booking':
          response = await this.handleBookingIntent(request.userId, context, entities, lang);
          break;
        case 'cancel':
          response = await this.handleCancelIntent(request.userId, context, lang);
          break;
        case 'help':
          response = { reply: t('help', lang), intent: 'help', entities: {} };
          break;
        case 'greeting':
          response = { reply: t('greeting', lang), intent: 'greeting', entities: {} };
          break;
        case 'goodbye':
          response = { reply: t('goodbye', lang), intent: 'goodbye', entities: {} };
          break;
        case 'feedback':
          response = { reply: t('feedback', lang), intent: 'feedback', entities: {} };
          break;
        default:
          response = { reply: t('unknown', lang), intent: 'unknown', entities: {} };
      }

      // 5. Update context
      context.lastIntent = response.intent;
      context.lastEntities = entities;
      context.messageHistory.push(
        { role: 'user', content: request.query, timestamp: new Date() },
        { role: 'assistant', content: response.reply, timestamp: new Date() },
      );
      context.timestamp = new Date();
      this.contexts.set(sessionId, context);
      this.cleanupOldContexts();

      return { ...response, sessionId };
    } catch (error) {
      this.logger.error(`[Chatbot] Error: ${getErrorMessage(error)}`);
      return { reply: t('error', 'fr'), intent: 'error', entities: {} };
    }
  }

  // ── FALLBACK INTENT DETECTION (keyword shortcut) ──────────────────────────
  private fallbackIntentDetection(query: string): string {
    const norm = normalize(query);
    const checks: [RegExp, string][] = [
      [/cherche|trouve|nchof|find|search|ابحث|nchouf/, 'search'],
      [/reserver|book|hejez|nhejez|احجز|reservation/, 'booking'],
      [/annuler|cancel|batel|nbatel|الغ|lheg/, 'cancel'],
      [/aide|help|3aweni|mosa3da|ساعدني|مساعدة/, 'help'],
      [/bonjour|hello|salam|ahla|مرحبا|السلام/, 'greeting'],
      [/au revoir|bye|beslema|yalla|مع السلامة/, 'goodbye'],
      [/avis|feedback|ra2y|تقييم|review/, 'feedback'],
    ];
    for (const [pattern, intent] of checks) {
      if (pattern.test(norm)) return intent;
    }
    return 'unknown';
  }

  // ── HANDLE SEARCH ─────────────────────────────────────────────────────────
  private async handleSearchIntent(
    query: string,
    location: { lat: number; lng: number } | undefined,
    entities: any,
    lang: Language,
  ): Promise<ChatbotResponseDto> {
    try {
      const searchQuery: any = { isActive: true };
      if (entities?.category) searchQuery.category = entities.category;
      if (entities?.price) searchQuery.basePrice = { $lte: entities.price };

      let services: any[] = [];
      const useGeo = location?.lat && location?.lng;

      // Geo search first
      if (useGeo) {
        const radius = entities?.radius || 10;
        services = await this.serviceModel
          .find({
            ...searchQuery,
            location: {
              $near: {
                $geometry: { type: 'Point', coordinates: [location!.lng, location!.lat] },
                $maxDistance: radius * 1000,
              },
            },
          })
          .limit(6)
          .exec();
      }

      // Fallback: text / city search
      if (!useGeo || services.length === 0) {
        if (entities?.locationName) {
          searchQuery['location.city'] = { $regex: entities.locationName, $options: 'i' };
        }
        services = await this.serviceModel.find(searchQuery).limit(6).exec();
      }

      if (services.length === 0) {
        return { reply: t('search_no_results', lang), intent: 'search', entities: entities || {} };
      }

      return {
        reply: this.formatSearchResults(services, lang),
        intent: 'search',
        entities: entities || {},
        data: { services },
      };
    } catch (error) {
      this.logger.error(`[Search] Error: ${getErrorMessage(error)}`);
      return { reply: t('search_error', lang), intent: 'error', entities: {} };
    }
  }

  // ── HANDLE BOOKING ────────────────────────────────────────────────────────
  private async handleBookingIntent(
    userId: string | undefined,
    context: ConversationContext,
    entities: any,
    lang: Language,
  ): Promise<ChatbotResponseDto> {
    if (!userId) {
      return { reply: t('booking_no_login', lang), intent: 'booking', entities: {} };
    }
    if (context.step === 'booking' && context.tempData) {
      return this.confirmBooking(context.tempData, userId, lang);
    }
    return { reply: t('booking_help', lang), intent: 'booking', entities: {} };
  }

  // ── HANDLE CANCEL ─────────────────────────────────────────────────────────
  private async handleCancelIntent(
    userId: string | undefined,
    context: ConversationContext,
    lang: Language,
  ): Promise<ChatbotResponseDto> {
    if (!userId) {
      return { reply: t('cancel_no_login', lang), intent: 'cancel', entities: {} };
    }

    const reservations = await this.reservationModel
      .find({ clientId: new Types.ObjectId(userId), status: { $in: ['pending', 'confirmed'] } })
      .populate('serviceId', 'name')
      .limit(5)
      .exec();

    if (reservations.length === 0) {
      return { reply: t('cancel_no_reservations', lang), intent: 'cancel', entities: {} };
    }

    const locale = lang === 'fr' ? 'fr-FR' : 'en-US';
    const list = reservations
      .map((r, i) => {
        const name = (r.serviceId as any)?.name ?? '?';
        const date = new Date(r.startTime).toLocaleString(locale);
        return `${i + 1}. ${name} — ${date}`;
      })
      .join('\n');

    const cancelQuestion: Record<Language, string> = {
      fr: `❌ Vos réservations actives :\n\n${list}\n\nDites-moi le numéro à annuler.`,
      en: `❌ Your active reservations:\n\n${list}\n\nTell me which number to cancel.`,
      tn: `❌ Hejzek el mawjoudin:\n\n${list}\n\nA3tini rqem li teb9a tbattel.`,
      ar: `❌ حجوزاتك النشطة:\n\n${list}\n\nأعطني الرقم الذي تريد إلغاءه.`,
    };

    context.tempData = { reservations };
    context.step = 'cancelling';

    return {
      reply: cancelQuestion[lang] ?? cancelQuestion.fr,
      intent: 'cancel',
      entities: { reservations },
    };
  }

  // ── CONFIRM BOOKING ───────────────────────────────────────────────────────
  private async confirmBooking(
    tempData: any,
    userId: string,
    lang: Language,
  ): Promise<ChatbotResponseDto> {
    try {
      const user = await this.userModel?.findById(userId).select('email firstName').exec();
      if (user?.email) {
        await this.emailService.sendReservationConfirmation(
          user.email,
          tempData.serviceName || 'Service',
          tempData.date || new Date().toISOString(),
          tempData.time || '',
          user.firstName,
        );
      }
      return { reply: t('confirm_booking', lang), intent: 'booking_complete', entities: {} };
    } catch (error) {
      this.logger.error(`[ConfirmBooking] Error: ${getErrorMessage(error)}`);
      const fallback: Record<Language, string> = {
        fr: '✅ Réservation confirmée ! (Email non envoyé)',
        en: '✅ Reservation confirmed! (Email not sent)',
        tn: '✅ Hejzek mzabt! (Email mach mchouch)',
        ar: '✅ تم تأكيد الحجز! (لم يتم إرسال البريد)',
      };
      return { reply: fallback[lang] ?? fallback.fr, intent: 'booking_complete', entities: {} };
    }
  }

  // ── FORMAT SEARCH RESULTS ─────────────────────────────────────────────────
  private formatSearchResults(services: ServiceDocument[], lang: Language): string {
    const titles: Record<Language, string> = {
      fr: 'résultat(s) trouvé(s)',
      en: 'result(s) found',
      tn: 'natayej lqitom',
      ar: 'نتيجة/نتائج وجدتها',
    };
    const askStr: Record<Language, string> = {
      fr: '\n\n💬 Voulez-vous réserver l\'un de ces services ?',
      en: '\n\n💬 Would you like to book one of these services?',
      tn: '\n\n💬 T7eb te7ej fi wa7da mel khedmat hethi?',
      ar: '\n\n💬 هل تريد حجز إحدى هذه الخدمات؟',
    };
    const reviewStr: Record<Language, string> = {
      fr: 'avis', en: 'reviews', tn: 'ta3li9at', ar: 'تقييمات',
    };

    let reply = `🎯 **${services.length} ${titles[lang] ?? titles.fr} :**\n\n`;

    services.forEach((s: any, i) => {
      reply += `**${i + 1}. ${s.name}**\n`;
      if (s.location?.address) reply += `   📍 ${s.location.address}\n`;
      if (s.location?.city)    reply += `   🏙️ ${s.location.city}\n`;
      reply += `   ⭐ ${s.avgRating ?? 0}/5 (${s.reviewCount ?? 0} ${reviewStr[lang] ?? 'avis'})\n`;
      reply += `   💰 ${s.basePrice} DT\n`;
      if (s.duration) reply += `   🕐 ${s.duration} min\n`;
      reply += '\n';
    });

    reply += askStr[lang] ?? askStr.fr;
    return reply;
  }

  // ── RECOMMENDATIONS ───────────────────────────────────────────────────────
  async getRecommendations(userId: string, limit = 10): Promise<any[]> {
    return this.recommendationService.getPersonalizedRecommendations(userId, limit);
  }

  // ── UTILITIES ─────────────────────────────────────────────────────────────
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private getContext(sessionId: string): ConversationContext {
    if (!this.contexts.has(sessionId)) {
      this.contexts.set(sessionId, {
        sessionId,
        detectedLang: 'fr',
        lastIntent: 'idle',
        lastEntities: {},
        step: 'idle',
        tempData: {},
        messageHistory: [],
        timestamp: new Date(),
      });
    }
    return this.contexts.get(sessionId)!;
  }

  private checkRateLimit(userId: string, limit = 20, windowMs = 60_000): boolean {
    const now = Date.now();
    const reqs = (this.rateLimits.get(userId) || []).filter(t => now - t < windowMs);
    if (reqs.length >= limit) return false;
    reqs.push(now);
    this.rateLimits.set(userId, reqs);
    return true;
  }

  private cleanupOldContexts(): void {
    const maxAge = 30 * 60 * 1000; // 30 min
    const now = Date.now();
    for (const [id, ctx] of this.contexts.entries()) {
      if (now - ctx.timestamp.getTime() > maxAge) this.contexts.delete(id);
    }
  }
}