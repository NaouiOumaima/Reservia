// src/modules/ai/services/nlp.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntentResponseDto } from '../dto/ai.dto';
import {
  Language,
  INTENT_KEYWORDS_FR,
  INTENT_KEYWORDS_EN,
  INTENT_KEYWORDS_TN,
  INTENT_KEYWORDS_AR,
  CATEGORY_KEYWORDS_FR,
  CATEGORY_KEYWORDS_EN,
  CATEGORY_KEYWORDS_TN,
  CATEGORY_KEYWORDS_AR,
  SENTIMENT_POS,
  SENTIMENT_NEG,
  LANG_FINGERPRINTS,
  TUNISIAN_CITIES,
  PRICE_PATTERNS,
  TIME_PATTERNS,
  NEAR_ME_PATTERNS,
  PEOPLE_PATTERN,
} from './constants/language.constants';

// ─────────────────────────────────────────────────────────────────────────────
// TEXT UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[''`]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function fuzzyIncludes(text: string, keyword: string): boolean {
  if (text.includes(keyword)) return true;
  const words = text.split(/\s+/);
  const maxDist = keyword.length <= 3 ? 0 : keyword.length <= 5 ? 1 : keyword.length <= 8 ? 2 : 3;
  return words.some(w => levenshtein(w, keyword) <= maxDist);
}

// ─────────────────────────────────────────────────────────────────────────────
// MERGE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function mergeKeywords(
  dicts: Record<string, string[]>[]
): Record<string, string[]> {
  const merged: Record<string, string[]> = {};
  for (const dict of dicts) {
    for (const [key, kws] of Object.entries(dict)) {
      if (!merged[key]) merged[key] = [];
      merged[key].push(...kws);
    }
  }
  return merged;
}

// Unified lookup tables (computed once at module load)
const ALL_INTENT_KEYWORDS = mergeKeywords([
  INTENT_KEYWORDS_FR,
  INTENT_KEYWORDS_EN,
  INTENT_KEYWORDS_TN,
  INTENT_KEYWORDS_AR,
]);

const ALL_CATEGORY_KEYWORDS = mergeKeywords([
  CATEGORY_KEYWORDS_FR,
  CATEGORY_KEYWORDS_EN,
  CATEGORY_KEYWORDS_TN,
  CATEGORY_KEYWORDS_AR,
]);

// ─────────────────────────────────────────────────────────────────────────────
// NLP SERVICE
// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class NlpService {
  private readonly logger = new Logger(NlpService.name);

  constructor(private configService: ConfigService) {}

  // ── PUBLIC: analyzeIntent ─────────────────────────────────────────────────
  async analyzeIntent(rawText: string): Promise<IntentResponseDto> {
    const text = normalize(rawText);
    const detectedLang = this.detectLanguage(rawText, text);

    // Score each intent — language-aware (boost score for matching lang dict)
    let bestIntent = 'unknown';
    let bestScore = 0;

    const langDicts: Record<Language, Record<string, string[]>> = {
      fr: INTENT_KEYWORDS_FR,
      en: INTENT_KEYWORDS_EN,
      tn: INTENT_KEYWORDS_TN,
      ar: INTENT_KEYWORDS_AR,
    };

    for (const [intent, keywords] of Object.entries(ALL_INTENT_KEYWORDS)) {
      let score = 0;
      for (const keyword of keywords) {
        const nk = normalize(keyword);
        // Full match
        if (text === nk) { score += 6; continue; }
        // Substring match
        if (text.includes(nk)) {
          // Bonus if it's in the detected language dict
          const isLangMatch = langDicts[detectedLang]?.[intent]?.some(
            k => normalize(k) === nk
          );
          score += isLangMatch ? 4 : 3;
          continue;
        }
        // Fuzzy for single words
        if (!nk.includes(' ') && fuzzyIncludes(text, nk)) { score += 2; continue; }
        // N-gram for multi-word
        if (nk.includes(' ') && this.ngramMatch(text, nk)) { score += 2; }
      }
      if (score > bestScore) { bestScore = score; bestIntent = intent; }
    }

    if (bestScore < 2) bestIntent = 'unknown';

    const entities = await this.extractEntities(rawText, text, detectedLang);
    const sentiment = this.analyzeSentiment(text, detectedLang);
    const confidence = Math.min(0.97, bestScore / 12);

    this.logger.debug(
      `[NLP] lang=${detectedLang} | intent=${bestIntent} | score=${bestScore} | conf=${confidence.toFixed(2)}`
    );

    return { intent: bestIntent, confidence, entities, sentiment };
  }

  // ── PUBLIC: extractEntities ───────────────────────────────────────────────
  async extractEntities(
    rawText: string,
    normalizedText?: string,
    lang?: Language,
  ): Promise<any> {
    const text = normalizedText || normalize(rawText);
    const detectedLang = lang || this.detectLanguage(rawText, text);
    const entities: any = { detectedLang };

    // 1. Category — try lang-specific first, then all
    const catDicts: Record<Language, Record<string, string[]>> = {
      fr: CATEGORY_KEYWORDS_FR,
      en: CATEGORY_KEYWORDS_EN,
      tn: CATEGORY_KEYWORDS_TN,
      ar: CATEGORY_KEYWORDS_AR,
    };

    const primaryDict = catDicts[detectedLang];
    outer:
    for (const dict of [primaryDict, ALL_CATEGORY_KEYWORDS]) {
      for (const [category, keywords] of Object.entries(dict)) {
        for (const kw of keywords) {
          const nk = normalize(kw);
          if (text.includes(nk) || (!nk.includes(' ') && fuzzyIncludes(text, nk))) {
            entities.category = category;
            break outer;
          }
        }
      }
      if (entities.category) break;
    }

    // 2. Price
    for (const pattern of PRICE_PATTERNS) {
      const m = rawText.match(pattern);
      if (m) {
        const val = parseFloat((m[1] || m[0]).replace(',', '.'));
        if (!isNaN(val) && val > 0) { entities.price = val; break; }
      }
    }

    // 3. Guests / people
    const pm = rawText.match(PEOPLE_PATTERN);
    if (pm) entities.guests = parseInt(pm[1], 10);

    // 4. Location (city)
    for (const city of TUNISIAN_CITIES) {
      const nc = normalize(city);
      if (text.includes(nc) || fuzzyIncludes(text, nc)) {
        entities.locationName = city;
        break;
      }
    }

    // 5. Time reference
    for (const pattern of TIME_PATTERNS) {
      const m = rawText.match(pattern);
      if (m) { entities.timeReference = m[0]; break; }
    }

    // 6. Near me
    entities.wantsNearby = NEAR_ME_PATTERNS.some(p => text.includes(normalize(p)));

    return entities;
  }

  // ── PUBLIC: detectLanguage ────────────────────────────────────────────────
  detectLanguage(rawText: string, normalizedText?: string): Language {
    const text = normalizedText || normalize(rawText);

    // Step 1 — Arabic Unicode score (fastest signal)
    const arabicChars = (rawText.match(/[\u0600-\u06FF]/g) || []).length;
    const totalChars = rawText.replace(/\s/g, '').length || 1;
    if (arabicChars / totalChars > 0.35) return 'ar';

    // Step 2 — Fingerprint scoring (weighted)
    const scores: Record<Language, number> = { tn: 0, fr: 0, en: 0, ar: 0 };

    for (const [lang, words] of Object.entries(LANG_FINGERPRINTS) as [Language, string[]][]) {
      for (const word of words) {
        const nw = normalize(word);
        if (text === nw) { scores[lang] += 4; continue; }
        // Whole-word match (surrounded by spaces or boundaries)
        const wordRe = new RegExp(`(^|\\s)${nw}(\\s|$)`);
        if (wordRe.test(text)) { scores[lang] += 3; continue; }
        if (text.includes(nw)) scores[lang] += 2;
      }
    }

    // Step 3 — pick winner, with Tunisian bias for ties (most specific dialect)
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) return 'fr'; // default

    // Tunisian wins ties (most distinctive / hardest to confuse)
    if (scores.tn === maxScore) return 'tn';
    if (scores.ar === maxScore) return 'ar';
    if (scores.fr === maxScore) return 'fr';
    return 'en';
  }

  // ── PUBLIC: analyzeSentiment ──────────────────────────────────────────────
  analyzeSentiment(
    text: string,
    lang?: Language,
  ): 'positive' | 'negative' | 'neutral' {
    // Collect from detected lang first (weighted), then all others (half weight)
    const detectedLang = lang || 'fr';

    let p = 0, n = 0;

    const allLangs: Language[] = ['fr', 'en', 'tn', 'ar'];
    for (const l of allLangs) {
      const weight = l === detectedLang ? 2 : 1;
      for (const w of SENTIMENT_POS[l]) if (text.includes(normalize(w))) p += weight;
      for (const w of SENTIMENT_NEG[l]) if (text.includes(normalize(w))) n += weight;
    }

    if (p > n) return 'positive';
    if (n > p) return 'negative';
    return 'neutral';
  }

  // ── PUBLIC: generateResponse ──────────────────────────────────────────────
  async generateResponse(intent: string, entities: any, context?: any): Promise<string> {
    const lang: Language = (entities.detectedLang as Language) || 'fr';

    const map: Record<string, Record<Language, () => string>> = {
      search: {
        fr: () => {
          let r = 'Je recherche ';
          if (entities.category) r += `des ${entities.category}s `;
          if (entities.locationName) r += `à ${entities.locationName} `;
          if (entities.wantsNearby) r += 'près de vous ';
          return r + ': voici les résultats.';
        },
        en: () => {
          let r = 'Searching ';
          if (entities.category) r += `for ${entities.category}s `;
          if (entities.locationName) r += `in ${entities.locationName} `;
          if (entities.wantsNearby) r += 'near you ';
          return r + ': here are the results.';
        },
        tn: () => {
          let r = 'Nchof ';
          if (entities.category) r += `${entities.category} `;
          if (entities.locationName) r += `fi ${entities.locationName} `;
          if (entities.wantsNearby) r += 'qribek ';
          return r + ': haw el natayej.';
        },
        ar: () => {
          let r = 'أبحث ';
          if (entities.category) r += `عن ${entities.category} `;
          if (entities.locationName) r += `في ${entities.locationName} `;
          if (entities.wantsNearby) r += 'بالقرب منك ';
          return r + ': إليك النتائج.';
        },
      },
      booking: {
        fr: () => {
          let r = 'Je vous aide à réserver. ';
          if (entities.category) r += `Pour un ${entities.category}, `;
          if (entities.guests) r += `pour ${entities.guests} personne(s), `;
          return r + 'quand souhaitez-vous venir ?';
        },
        en: () => {
          let r = "Let me help you book. ";
          if (entities.category) r += `For a ${entities.category}, `;
          if (entities.guests) r += `for ${entities.guests} guest(s), `;
          return r + 'when would you like to come?';
        },
        tn: () => {
          let r = 'Naawenek tehji. ';
          if (entities.category) r += `Bech tehji ${entities.category}, `;
          if (entities.guests) r += `l ${entities.guests} nefar, `;
          return r + 'waqteh teb9a tji?';
        },
        ar: () => {
          let r = 'سأساعدك في الحجز. ';
          if (entities.category) r += `لحجز ${entities.category}، `;
          if (entities.guests) r += `لـ ${entities.guests} شخص، `;
          return r + 'متى تريد أن تأتي؟';
        },
      },
      cancel: {
        fr: () => context?.hasReservations
          ? 'Laquelle de vos réservations souhaitez-vous annuler ?'
          : "Vous n'avez aucune réservation active.",
        en: () => context?.hasReservations
          ? 'Which reservation would you like to cancel?'
          : 'You have no active reservations.',
        tn: () => context?.hasReservations
          ? 'Aneha el hjez li teb9a tbattel?'
          : "Ma3andekch 7ejz ta3tich.",
        ar: () => context?.hasReservations
          ? 'أي حجز تريد أن تلغي؟'
          : 'ليس لديك أي حجز نشط.',
      },
      help: {
        fr: () => '🤖 Tapez **aide** pour voir les commandes. Je parle 🇫🇷 🇬🇧 🇹🇳 !',
        en: () => '🤖 Type **help** to see commands. I speak 🇫🇷 🇬🇧 🇹🇳 !',
        tn: () => '🤖 Ekteb **mosa3da** bech tchouf el commandes. Nfahem Faransawi, Anglais w Tunisi!',
        ar: () => '🤖 اكتب **مساعدة** لرؤية الأوامر. أتحدث الفرنسية والإنجليزية والعربية!',
      },
      greeting: {
        fr: () => 'Bonjour ! Kifeh nel3awnek ? 😊',
        en: () => 'Hello! How can I help you today? 😊',
        tn: () => 'Ahla! Kifeh nel3awnek? 😊',
        ar: () => 'مرحبا! كيف أساعدك؟ 😊',
      },
      feedback: {
        fr: () => 'Merci pour votre retour ! Pour quel service souhaitez-vous laisser un avis ?',
        en: () => 'Thanks for your feedback! Which service would you like to review?',
        tn: () => 'Shokran 3la ra2yek! 3leh khidma tehb ta3ti ra2yek?',
        ar: () => 'شكراً على رأيك! لأي خدمة تريد تقييم؟',
      },
      goodbye: {
        fr: () => 'Au revoir ! Bonne journée ! 👋',
        en: () => 'Goodbye! Have a great day! 👋',
        tn: () => 'Beslema! Nhar sa3id! 👋',
        ar: () => 'مع السلامة! يوم سعيد! 👋',
      },
    };

    const intentMap = map[intent];
    if (!intentMap) return map.help[lang]();
    return intentMap[lang]?.() ?? intentMap['fr']?.() ?? '';
  }

  // ── PRIVATE: n-gram fuzzy match ───────────────────────────────────────────
  private ngramMatch(text: string, phrase: string): boolean {
    const pw = phrase.split(' ');
    const tw = text.split(' ');
    if (tw.length < pw.length) return false;
    for (let i = 0; i <= tw.length - pw.length; i++) {
      const chunk = tw.slice(i, i + pw.length).join(' ');
      if (levenshtein(chunk, phrase) <= Math.min(2, Math.floor(phrase.length / 5))) return true;
    }
    return false;
  }
}