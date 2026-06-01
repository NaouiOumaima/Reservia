// src/modules/ai/services/ai.service.ts
// ══════════════════════════════════════════════════════════════
//  CHATBOT IA GÉNÉRATIF — Ollama + Actions DB réelles
//  Aligné sur les schemas exacts de Reservia
// ══════════════════════════════════════════════════════════════

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { Service, ServiceDocument } from '../../../database/schemas/service.schema';
import { Reservation, ReservationDocument } from '../../../database/schemas/reservation.schema';
import { Review, ReviewDocument } from '../../../database/schemas/review.schema';
import { EmailService } from '../../email/email.service';
import { ChatbotRequestDto, ChatbotResponseDto } from '../dto/ai.dto';
import { Language } from './constants/language.constants';

function getErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface SessionContext {
  history: ChatMessage[];
  userId?: string;
  lang: Language;
  lastUpdated: Date;
  bookingFlow?: {
    step: 'choose_service' | 'choose_date' | 'choose_time' | 'confirm';
    serviceId?: string;
    serviceName?: string;
    date?: string;   // format: YYYY-MM-DD
    time?: string;   // format: HH:MM
  };
  cancelFlow?: {
    step: 'choose_reservation';
    reservations: Array<{ id: string; serviceName: string; date: string; status: string }>;
  };
  reviewFlow?: {
    step: 'choose_service' | 'choose_rating' | 'write_comment';
    serviceId?: string;
    serviceName?: string;
    rating?: number;
  };
}

interface OllamaResponse {
  message: { role: string; content: string };
  done: boolean;
}

// ══════════════════════════════════════════════════════════════
//  SYSTEM PROMPT
// ══════════════════════════════════════════════════════════════

const CONVERSATION_SYSTEM = (dbContext: string) => `
Tu es l'assistant IA de Reservia, plateforme tunisienne de réservation de services.

## Données disponibles
${dbContext}

## Langue
Détecte et réponds TOUJOURS dans la langue de l'utilisateur :
Français | English | Tunisien/Darija (nheb/nchouf/hejez/mzyan...) | Arabe

## Ce que tu peux faire
- 🔍 Rechercher et présenter des services depuis la DB
- 🏆 Classer les services par note (🥇🥈🥉)
- 📅 Guider une réservation étape par étape
- ❌ Aider à annuler une réservation
- ⭐ Collecter un avis sur un service
- ❓ Répondre aux questions générales

## Format résultats
**Nom** (Catégorie) · 📍 Ville · ⭐X.X/5 · 💰X DT

## Guide réservation (étapes strictes)
1. Confirme le service (montre son ID entre [])
2. Demande la date (format demandé : JJ/MM/AAAA)
3. Demande l'heure (format : HH:MM)
4. Récapitule et demande confirmation explicite (oui / confirmer / ok)

## Guide annulation
1. Affiche les réservations actives numérotées
2. Demande le numéro
3. Demande confirmation explicite

## Guide avis
1. Demande pour quel service (parmi ceux utilisés)
2. Demande note 1-5
3. Demande commentaire
4. Confirme enregistrement

## Règles absolues
- Non connecté → demander de se connecter pour toute action
- Ne jamais inventer de données absentes du contexte
- Réponses courtes et chaleureuses
`;

const ACTION_EXTRACTION_PROMPT = (userMessage: string, sessionJson: string) => `
Analyse ce message dans ce contexte de session de réservation.

Message: "${userMessage}"
Session: ${sessionJson}

Réponds UNIQUEMENT avec du JSON valide, rien d'autre, sans markdown.
{
  "action": "none",
  "extractedInfo": {
    "serviceId": null,
    "date": null,
    "time": null,
    "reservationIndex": null,
    "rating": null,
    "comment": null,
    "isConfirmation": false
  }
}

Règles:
- action "create_booking" : l'utilisateur confirme (oui/ok/confirmer/aywa/نعم) ET bookingFlow a serviceId + date + time
- action "cancel_booking" : l'utilisateur confirme une annulation avec un numéro
- action "create_review" : note (1-5) ET commentaire fournis dans ce message ou session
- sinon "none"
- date: convertir en YYYY-MM-DD si possible (ex: "15/06/2026" -> "2026-06-15")
- time: format HH:MM (ex: "14h30" -> "14:30", "2pm" -> "14:00")
- isConfirmation: true si oui/yes/ok/confirmer/aywa/نعم/c'est bon/nheb
`;

// ══════════════════════════════════════════════════════════════
//  SERVICE PRINCIPAL
// ══════════════════════════════════════════════════════════════

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly ollamaUrl: string;
  private readonly ollamaModel: string;
  private readonly sessions = new Map<string, SessionContext>();
  private readonly rateLimits = new Map<string, number[]>();

  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel('User') private userModel: Model<any>,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {
    this.ollamaUrl = this.configService.get<string>('OLLAMA_URL') || 'http://localhost:11434';
    this.ollamaModel = this.configService.get<string>('OLLAMA_MODEL') || 'llama3';
    this.logger.log(`[Ollama] ${this.ollamaUrl} | model=${this.ollamaModel}`);
    setInterval(() => this.cleanupSessions(), 30 * 60 * 1000);
  }

  // ─────────────────────────────────────────────────────────────
  // POINT D'ENTRÉE
  // ─────────────────────────────────────────────────────────────

  async chatbot(request: ChatbotRequestDto): Promise<ChatbotResponseDto> {
    const sessionId = request.sessionId || this.generateSessionId();

    try {
      if (request.userId && !this.checkRateLimit(request.userId)) {
        return {
          reply: this.getRateLimitMsg(request.language as Language),
          intent: 'rate_limited', entities: {}, sessionId,
        };
      }

      const session = this.getOrCreateSession(sessionId, request.userId, request.language as Language);

      // 1. Met à jour le flow avant l'extraction (pour que l'extraction ait le bon contexte)
      this.updateSessionFlow(session, request.query);

      // 2. Extraction d'action structurée via Ollama
      const actionSignal = await this.extractAction(request.query, session);

      // 3. Met à jour le flow avec les infos extraites
      this.applyExtractedInfo(session, actionSignal.extractedInfo);

      // 4. Exécute l'action DB si déclenchée
      let dbActionResult: string | null = null;
      if (actionSignal.action === 'create_booking' && request.userId) {
        dbActionResult = await this.executeCreateBooking(session, request.userId);
      } else if (actionSignal.action === 'cancel_booking' && request.userId) {
        dbActionResult = await this.executeCancelBooking(session, actionSignal.extractedInfo, request.userId);
      } else if (actionSignal.action === 'create_review' && request.userId) {
        dbActionResult = await this.executeCreateReview(session, actionSignal.extractedInfo, request.userId);
      }

      // 5. Construit le contexte DB dynamique
      const dbContext = await this.buildDatabaseContext(request.query, request.userId, session);
      const contextWithResult = dbActionResult
        ? `${dbContext}\n\n### Résultat action\n${dbActionResult}`
        : dbContext;

      // 6. Génère la réponse conversationnelle
      const messages: ChatMessage[] = [
        { role: 'system', content: CONVERSATION_SYSTEM(contextWithResult) },
        ...session.history,
        { role: 'user', content: request.query },
      ];
      const reply = await this.callOllama(messages);

      // 7. Sauvegarde l'historique (max 30 tours = 60 messages)
      session.history.push(
        { role: 'user', content: request.query },
        { role: 'assistant', content: reply },
      );
      if (session.history.length > 60) session.history = session.history.slice(-60);
      session.lastUpdated = new Date();
      this.sessions.set(sessionId, session);

      const intent = this.detectIntent(request.query);
      this.logger.log(`[AI] session=${sessionId} intent=${intent} action=${actionSignal.action}`);

      return { reply, intent, entities: {}, sessionId };

    } catch (error) {
      this.logger.error(`[Chatbot] ${getErrorMessage(error)}`);
      if (getErrorMessage(error).includes('ECONNREFUSED')) {
        return {
          reply: `❌ Ollama n'est pas démarré. Lancez : \`ollama serve\``,
          intent: 'error', entities: {}, sessionId,
        };
      }
      return { reply: '😔 Une erreur est survenue. Veuillez réessayer.', intent: 'error', entities: {}, sessionId };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // EXTRACTION D'ACTION
  // ─────────────────────────────────────────────────────────────

  private async extractAction(userMessage: string, session: SessionContext): Promise<any> {
    const sessionSummary = JSON.stringify({
      bookingFlow: session.bookingFlow || null,
      cancelFlow: session.cancelFlow
        ? { step: session.cancelFlow.step, count: session.cancelFlow.reservations?.length }
        : null,
      reviewFlow: session.reviewFlow || null,
    });

    try {
      const response = await fetch(`${this.ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.ollamaModel,
          messages: [{ role: 'user', content: ACTION_EXTRACTION_PROMPT(userMessage, sessionSummary) }],
          stream: false,
          options: { temperature: 0.1 },
          format: 'json',
        }),
      });
      const data: OllamaResponse = await response.json();
      const raw = data.message?.content?.trim() || '{}';
      // Nettoie les éventuels backticks markdown que certains modèles ajoutent
      const clean = raw.replace(/```json|```/g, '').trim();
      return JSON.parse(clean);
    } catch {
      return { action: 'none', extractedInfo: {} };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // ACTION 1 : CRÉER UNE RÉSERVATION
  // Schema Reservation: clientId, serviceId, startTime, endTime,
  //                     duration, price, status, expiresAt
  // ─────────────────────────────────────────────────────────────

  private async executeCreateBooking(session: SessionContext, userId: string): Promise<string> {
    const flow = session.bookingFlow;
    if (!flow?.serviceId || !flow.date || !flow.time) {
      return '⚠️ Informations incomplètes — serviceId, date et heure sont requis.';
    }

    try {
      const startTime = new Date(`${flow.date}T${flow.time}:00`);
      if (isNaN(startTime.getTime())) {
        return `❌ Date/heure invalide: ${flow.date} ${flow.time}. Format attendu: YYYY-MM-DD HH:MM`;
      }

      // Récupère le service (duration et price sont dans le schema Service)
      const service = await this.serviceModel
        .findById(flow.serviceId)
        .select('name duration basePrice discountPrice')
        .lean().exec();
      if (!service) return '❌ Service introuvable.';

      const durationMin: number = service.duration || 60;
      const endTime = new Date(startTime.getTime() + durationMin * 60 * 1000);
      // expiresAt = startTime + 15 minutes (délai de confirmation)
      const expiresAt = new Date(startTime.getTime() + 15 * 60 * 1000);
      // Utilise discountPrice si disponible, sinon basePrice
      const price: number = (service as any).discountPrice || service.basePrice;

      // Vérifie les conflits de créneau
      const conflict = await this.reservationModel.findOne({
        serviceId: new Types.ObjectId(flow.serviceId),
        status: { $in: ['pending', 'confirmed'] },
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
      });
      if (conflict) {
        return `❌ Ce créneau est déjà réservé. Choisissez un autre horaire.`;
      }

      // Crée la réservation — champs exacts du schema Reservation
      const reservation = await this.reservationModel.create({
        clientId: new Types.ObjectId(userId),
        serviceId: new Types.ObjectId(flow.serviceId),
        startTime,
        endTime,
        duration: durationMin,         // ✅ requis dans le schema
        price,                          // ✅ requis dans le schema (pas totalPrice)
        status: 'pending',
        expiresAt,                      // ✅ requis dans le schema
      });

      // Email de confirmation
      try {
        const user = await this.userModel.findById(userId).select('email firstName').lean().exec() as any;
        if (user?.email) {
          await this.emailService.sendReservationConfirmation(
            user.email,
            service.name,
            flow.date,
            flow.time,
            user.firstName,
          );
        }
      } catch (emailErr) {
        this.logger.warn(`[Email] ${getErrorMessage(emailErr)}`);
      }

      // Réinitialise le flow
      session.bookingFlow = undefined;

      return `✅ Réservation créée ! ID: ${reservation._id} | ${service.name} | ${startTime.toLocaleString('fr-FR')} | ${price} DT | Statut: en attente`;

    } catch (err) {
      this.logger.error(`[Booking] ${getErrorMessage(err)}`);
      return `❌ Erreur réservation: ${getErrorMessage(err)}`;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // ACTION 2 : ANNULER UNE RÉSERVATION
  // ─────────────────────────────────────────────────────────────

  private async executeCancelBooking(
    session: SessionContext,
    extractedInfo: any,
    userId: string,
  ): Promise<string> {
    const index = (extractedInfo?.reservationIndex || 1) - 1;
    const cancelFlow = session.cancelFlow;

    if (!cancelFlow?.reservations?.length) {
      return '⚠️ Aucune réservation active en mémoire. Relancez le flow d\'annulation.';
    }

    const target = cancelFlow.reservations[index];
    if (!target) {
      return `❌ Numéro invalide. Choisissez entre 1 et ${cancelFlow.reservations.length}.`;
    }

    try {
      const reservation = await this.reservationModel.findById(target.id).lean().exec() as any;
      if (!reservation) return '❌ Réservation introuvable en base.';

      const hoursUntil = (new Date(reservation.startTime).getTime() - Date.now()) / 3_600_000;
      const isFreeCancel = hoursUntil >= 24;

      // Annulation — champs du schema Reservation
      await this.reservationModel.findByIdAndUpdate(target.id, {
        status: 'cancelled',
        cancelledAt: new Date(),                              // ✅ dans le schema
        cancellationReason: 'Annulé par le client via chatbot IA', // ✅ dans le schema
      });

      // Email optionnel (méthode peut ne pas exister)
      try {
        const user = await this.userModel.findById(userId).select('email firstName').lean().exec() as any;
        if (user?.email && typeof (this.emailService as any).sendReservationCancellation === 'function') {
          await (this.emailService as any).sendReservationCancellation(
            user.email, target.serviceName, target.date, user.firstName,
          );
        }
      } catch { /* ignore */ }

      session.cancelFlow = undefined;

      const refundMsg = isFreeCancel
        ? 'Remboursement sous 3-5 jours ouvrables.'
        : '⚠️ Annulation moins de 24h avant — frais possibles.';

      return `✅ "${target.serviceName}" annulé. ${refundMsg}`;

    } catch (err) {
      this.logger.error(`[Cancel] ${getErrorMessage(err)}`);
      return `❌ Erreur annulation: ${getErrorMessage(err)}`;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // ACTION 3 : CRÉER UN AVIS
  // Schema Review: userId, userName, userEmail, reviewType,
  //               serviceId, rating, comment (tous requis)
  // ─────────────────────────────────────────────────────────────

  private async executeCreateReview(
    session: SessionContext,
    extractedInfo: any,
    userId: string,
  ): Promise<string> {
    const flow = session.reviewFlow;
    const rating: number = extractedInfo?.rating || flow?.rating;
    const comment: string = extractedInfo?.comment;
    const serviceId: string = flow?.serviceId || extractedInfo?.serviceId;

    if (!serviceId || !rating || !comment) {
      return '⚠️ Avis incomplet — serviceId, note et commentaire requis.';
    }
    if (rating < 1 || rating > 5) {
      return '❌ La note doit être entre 1 et 5.';
    }

    try {
      // Récupère les infos utilisateur (userName et userEmail sont requis dans Review)
      const user = await this.userModel
        .findById(userId)
        .select('firstName lastName email')
        .lean().exec() as any;

      if (!user) return '❌ Utilisateur introuvable.';

      // Vérifie que l'utilisateur a une réservation confirmée pour ce service
      const hasBooked = await this.reservationModel.findOne({
        clientId: new Types.ObjectId(userId),
        serviceId: new Types.ObjectId(serviceId),
        status: 'confirmed',
      });
      if (!hasBooked) {
        return '⚠️ Vous pouvez noter uniquement un service avec une réservation confirmée.';
      }

      const userName = `${user.firstName} ${user.lastName}`.trim();
      const userEmail: string = user.email;

      // Récupère le nom du service
      const service = await this.serviceModel
        .findById(serviceId)
        .select('name providerId')
        .lean().exec() as any;

      // Vérifie avis existant (index unique userId + serviceId)
      const existing = await this.reviewModel.findOne({
        userId: new Types.ObjectId(userId),
        serviceId: new Types.ObjectId(serviceId),
      });

      if (existing) {
        // Met à jour — preserve les champs requis
        await this.reviewModel.findByIdAndUpdate(existing._id, {
          rating,
          comment,
          updatedAt: new Date(),
        });
      } else {
        // Crée — tous les champs requis du schema Review
        await this.reviewModel.create({
          userId: new Types.ObjectId(userId),
          userName,                                    // ✅ requis
          userEmail,                                   // ✅ requis
          reviewType: 'service',                       // ✅ requis, enum ['service','app']
          serviceId: new Types.ObjectId(serviceId),
          serviceName: service?.name || '',
          serviceProviderId: service?.providerId || null,
          rating,
          comment,
          isApproved: true,
          isDeleted: false,
        });
      }

      // Recalcule avgRating et reviewCount sur le service
      await this.updateServiceRating(serviceId);

      session.reviewFlow = undefined;

      const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
      return `✅ Avis enregistré ! ${stars} ${rating}/5 — Merci ${user.firstName} !`;

    } catch (err) {
      this.logger.error(`[Review] ${getErrorMessage(err)}`);
      return `❌ Erreur avis: ${getErrorMessage(err)}`;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RECALCUL RATING SERVICE
  // ─────────────────────────────────────────────────────────────

  private async updateServiceRating(serviceId: string): Promise<void> {
    try {
      const stats = await this.reviewModel.aggregate([
        {
          $match: {
            serviceId: new Types.ObjectId(serviceId),
            reviewType: 'service',
            isDeleted: false,
            isApproved: true,
          },
        },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            count: { $sum: 1 },
          },
        },
      ]);

      if (stats.length > 0) {
        await this.serviceModel.findByIdAndUpdate(serviceId, {
          avgRating: Math.round(stats[0].avgRating * 10) / 10,
          reviewCount: stats[0].count,
        });
      }
    } catch (err) {
      this.logger.warn(`[Rating] ${getErrorMessage(err)}`);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // MISE À JOUR DU FLOW DE SESSION
  // ─────────────────────────────────────────────────────────────

  private updateSessionFlow(session: SessionContext, query: string): void {
    const norm = normalize(query);

    if (/reserver|book|hejez|nhejez|احجز|je veux reserver|i want to book/i.test(norm)) {
      if (!session.bookingFlow) session.bookingFlow = { step: 'choose_service' };
    }
    if (/annul|cancel|batel|الغ|lheg/i.test(norm) && !session.cancelFlow) {
      session.cancelFlow = { step: 'choose_reservation', reservations: [] };
    }
    if (/avis|review|note|noter|تقييم|ra2y|feedback/i.test(norm) && !session.reviewFlow) {
      session.reviewFlow = { step: 'choose_service' };
    }
  }

  private applyExtractedInfo(session: SessionContext, extracted: any): void {
    if (!extracted) return;

    if (session.bookingFlow) {
      if (extracted.serviceId) session.bookingFlow.serviceId = extracted.serviceId;
      if (extracted.date) session.bookingFlow.date = extracted.date;
      if (extracted.time) session.bookingFlow.time = extracted.time;
    }
    if (session.reviewFlow) {
      if (extracted.serviceId) session.reviewFlow.serviceId = extracted.serviceId;
      if (extracted.rating) session.reviewFlow.rating = extracted.rating;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CONTEXTE DB DYNAMIQUE
  // ─────────────────────────────────────────────────────────────

  private async buildDatabaseContext(
    query: string,
    userId?: string,
    session?: SessionContext,
  ): Promise<string> {
    const parts: string[] = [];
    const norm = normalize(query);
    const isCancel = /annul|cancel|batel|الغ|lheg/i.test(norm) || !!session?.cancelFlow;
    const isReview = /avis|review|note|noter|تقييم|ra2y/i.test(norm) || !!session?.reviewFlow;

    // 1. Services disponibles (toujours chargés)
    try {
      const services = await this.serviceModel
        .find({ isActive: true })
        .sort({ avgRating: -1, reviewCount: -1 })
        .limit(10)
        .select('name category location basePrice discountPrice avgRating reviewCount duration')
        .lean().exec();

      if (services.length > 0) {
        const lines = services.map(s => {
          const loc = s.location as any;
          const addr = [loc?.address, loc?.city].filter(Boolean).join(', ') || 'Tunisie';
          const price = (s as any).discountPrice || s.basePrice;
          return `• **${s.name}** [ID:${s._id}] (${s.category}) — 📍 ${addr} — ⭐${(s.avgRating || 0).toFixed(1)}/5 · ${s.reviewCount || 0} avis · 💰${price} DT · 🕐${s.duration}min`;
        });
        parts.push('### Services disponibles\n' + lines.join('\n'));
      } else {
        parts.push('### Services\nAucun service actif pour le moment.');
      }
    } catch (err) {
      this.logger.warn(`[DB] Services: ${getErrorMessage(err)}`);
    }

    // 2. Réservations actives (pour annulation)
    if (userId && isCancel) {
      try {
        const reservations = await this.reservationModel
          .find({
            clientId: new Types.ObjectId(userId),
            status: { $in: ['pending', 'confirmed'] },
          })
          .populate('serviceId', 'name')
          .sort({ startTime: 1 })
          .limit(5).lean().exec();

        const formatted = reservations.map((r, i) => ({
          id: (r._id as any).toString(),
          serviceName: (r.serviceId as any)?.name || '?',
          date: new Date((r as any).startTime).toLocaleString('fr-FR'),
          status: r.status as string,
        }));

        if (session) {
          session.cancelFlow = { step: 'choose_reservation', reservations: formatted };
        }

        if (formatted.length > 0) {
          parts.push(
            '### Réservations actives\n' +
            formatted.map((r, i) => `${i + 1}. **${r.serviceName}** — ${r.date} (${r.status})`).join('\n'),
          );
        } else {
          parts.push('### Réservations actives\nAucune réservation active.');
        }
      } catch (err) {
        this.logger.warn(`[DB] Reservations: ${getErrorMessage(err)}`);
      }
    }

    // 3. Services avec réservation confirmée (pour avis)
    if (userId && isReview) {
      try {
        const confirmed = await this.reservationModel
          .find({ clientId: new Types.ObjectId(userId), status: 'confirmed' })
          .populate('serviceId', 'name')
          .limit(5).lean().exec();

        if (confirmed.length > 0) {
          const lines = confirmed.map((r, i) => {
            const s = r.serviceId as any;
            return `${i + 1}. **${s?.name}** [ID:${s?._id}]`;
          });
          parts.push('### Services utilisés (éligibles pour un avis)\n' + lines.join('\n'));
        } else {
          parts.push('### Services utilisés\nAucun service confirmé — avis impossible.');
        }
      } catch (err) {
        this.logger.warn(`[DB] Confirmed: ${getErrorMessage(err)}`);
      }
    }

    // 4. Statut utilisateur
    if (userId) {
      try {
        const user = await this.userModel
          .findById(userId)
          .select('firstName lastName email')
          .lean().exec() as any;
        if (user) {
          parts.push(`### Utilisateur connecté\n${user.firstName} ${user.lastName} — ${user.email}`);
        }
      } catch { /* ignore */ }
    } else {
      parts.push('### Statut\nVisiteur non connecté — connexion requise pour réserver, annuler ou noter.');
    }

    return parts.join('\n\n');
  }

  // ─────────────────────────────────────────────────────────────
  // APPEL OLLAMA
  // ─────────────────────────────────────────────────────────────

  private async callOllama(messages: ChatMessage[]): Promise<string> {
    const response = await fetch(`${this.ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(180_000),
      body: JSON.stringify({
        model: this.ollamaModel,
        messages,
        stream: false,
        options: { temperature: 0.7, top_p: 0.9, num_ctx: 4096 },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama HTTP ${response.status}: ${await response.text()}`);
    }

    const data: OllamaResponse = await response.json();
    return data.message?.content?.trim() || "Je n'ai pas pu générer une réponse.";
  }

  // ─────────────────────────────────────────────────────────────
  // RECOMMANDATIONS
  // ─────────────────────────────────────────────────────────────

  async getRecommendations(userId: string, limit = 5): Promise<any[]> {
    try {
      const services = await this.serviceModel
        .find({ isActive: true })
        .sort({ avgRating: -1, popularity: -1 })
        .limit(limit).lean().exec();

      return services.map(s => ({
        ...s,
        personalized: {
          alreadyBooked: false,
          recommendationScore: Math.round((s.avgRating || 0) * 20),
          matchReason: (s.avgRating || 0) >= 4.5 ? 'Très bien noté' : 'Populaire sur Reservia',
        },
      }));
    } catch { return []; }
  }

  // ─────────────────────────────────────────────────────────────
  // UTILITAIRES
  // ─────────────────────────────────────────────────────────────

  private detectIntent(query: string): string {
    const q = normalize(query);
    if (/meilleur|top|a7san|best|classement/.test(q)) return 'ranking';
    if (/cherche|trouve|find|search|nchof|ابحث/.test(q)) return 'search';
    if (/reserver|book|hejez|nhejez|احجز/.test(q)) return 'booking';
    if (/annul|cancel|batel|الغ|lheg/.test(q)) return 'cancel';
    if (/aide|help|3aweni|ساعدني/.test(q)) return 'help';
    if (/bonjour|hello|ahla|سلام|marhba/.test(q)) return 'greeting';
    if (/avis|feedback|note|تقييم|ra2y/.test(q)) return 'feedback';
    if (/bye|beslema|au revoir|مع السلامة/.test(q)) return 'goodbye';
    return 'general';
  }

  private getOrCreateSession(
    sessionId: string,
    userId?: string,
    lang: Language = 'fr',
  ): SessionContext {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        history: [], userId, lang, lastUpdated: new Date(),
      });
    }
    return this.sessions.get(sessionId)!;
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  private checkRateLimit(userId: string, maxReq = 60, windowMs = 60_000): boolean {
    const now = Date.now();
    const reqs = (this.rateLimits.get(userId) || []).filter(t => now - t < windowMs);
    if (reqs.length >= maxReq) return false;
    this.rateLimits.set(userId, [...reqs, now]);
    return true;
  }

  private getRateLimitMsg(lang: Language): string {
    const msgs: Record<Language, string> = {
      fr: '⏳ Trop de messages. Attendez quelques secondes.',
      en: '⏳ Too many messages. Please wait.',
      tn: '⏳ Barcha messages. Stanna chouya.',
      ar: '⏳ رسائل كثيرة. انتظر قليلاً.',
    };
    return msgs[lang] ?? msgs.fr;
  }

  private cleanupSessions(): void {
    const cutoff = new Date(Date.now() - 30 * 60 * 1000);
    for (const [id, s] of this.sessions.entries()) {
      if (s.lastUpdated < cutoff) this.sessions.delete(id);
    }
  }
}