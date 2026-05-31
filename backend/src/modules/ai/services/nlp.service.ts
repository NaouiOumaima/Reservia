// src/modules/ai/services/nlp.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntentResponseDto } from '../dto/ai.dto';
import {
  Language,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  ALL_INTENT_KEYWORDS,
  ALL_CATEGORY_KEYWORDS,
  SENTIMENT_POS,
  SENTIMENT_NEG,
  LOCALIZED_RESPONSES,
  DATE_PATTERNS
} from './constants/language.constants';
import { GUEST_PATTERNS, GUEST_TYPES, GuestType } from './constants/guest.patterns';

// ============================================
// TEXT UTILITIES MULTILINGUES
// ============================================

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[''`]/g, "'")
    .replace(/[^\w\s]/g, ' ')
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

function extractNumberFromText(text: string): number | null {
  // Motifs pour les nombres
  const patterns = [
    /(\d+)/,                                    // Nombre simple
    /un(?:e)?\s+(?!personne)/i,                 // "un", "une"
    /deux/i, /trois/i, /quatre/i, /cinq/i,      // Mots français
    /six/i, /sept/i, /huit/i, /neuf/i, /dix/i,
    /one/i, /two/i, /three/i, /four/i, /five/i, // Mots anglais
    /wa7ed/i, /thnayn/i, /thelatha/i, /arb3a/i, /khamsa/i, // Mots tunisiens
    /واحد/i, /اثنان/i, /ثلاثة/i, /أربعة/i, /خمسة/i // Mots arabes
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[1]) return parseInt(match[1]);
      // Mapping des mots
      const wordMap: Record<string, number> = {
        'un': 1, 'une': 1, 'deux': 2, 'trois': 3, 'quatre': 4, 'cinq': 5,
        'six': 6, 'sept': 7, 'huit': 8, 'neuf': 9, 'dix': 10,
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
        'wa7ed': 1, 'thnayn': 2, 'thelatha': 3, 'arb3a': 4, 'khamsa': 5,
        'واحد': 1, 'اثنان': 2, 'ثلاثة': 3, 'أربعة': 4, 'خمسة': 5
      };
      const word = match[0].toLowerCase();
      if (wordMap[word]) return wordMap[word];
    }
  }
  return null;
}

@Injectable()
export class NlpService {
  private readonly logger = new Logger(NlpService.name);

  constructor(private configService: ConfigService) {}

  async analyzeIntent(rawText: string): Promise<IntentResponseDto> {
    const text = normalize(rawText);
    const detectedLang = this.detectLanguage(rawText, text);
    
    let bestIntent = 'unknown';
    let bestScore = 0;
    const scores: Record<string, number> = {};

    // Analyser chaque langue et intention
    for (const [lang, intents] of Object.entries(ALL_INTENT_KEYWORDS)) {
      const langWeight = lang === detectedLang ? 2 : 1;
      
      for (const [intent, keywords] of Object.entries(intents)) {
        let score = 0;
        
        for (const keyword of keywords) {
          const nk = normalize(keyword);
          
          if (text === nk) {
            score += 6 * langWeight;
          } else if (text.includes(nk)) {
            score += 3 * langWeight;
          } else if (!nk.includes(' ') && fuzzyIncludes(text, nk)) {
            score += 2 * langWeight;
          } else if (nk.includes(' ') && this.ngramMatch(text, nk)) {
            score += 2 * langWeight;
          }
        }
        
        if (score > 0) {
          scores[intent] = (scores[intent] || 0) + score;
          if (scores[intent] > bestScore) {
            bestScore = scores[intent];
            bestIntent = intent;
          }
        }
      }
    }

    if (bestScore < 3) {
      bestIntent = 'unknown';
    }

    const entities = await this.extractEntities(rawText, text, detectedLang);
    const sentiment = this.analyzeSentiment(text, detectedLang);
    const confidence = Math.min(0.95, bestScore / 20);

    this.logger.debug(`[NLP] lang=${detectedLang} | intent=${bestIntent} | score=${bestScore} | conf=${confidence}`);

    return { intent: bestIntent, confidence, entities, sentiment };
  }

  async extractEntities(
    rawText: string,
    normalizedText?: string,
    lang?: Language,
  ): Promise<any> {
    const text = normalizedText || normalize(rawText);
    const detectedLang = lang || this.detectLanguage(rawText, text);
    const entities: any = { detectedLang, rawQuery: rawText };

    // 1. Extraction de la catégorie
    entities.category = await this.extractCategory(text, detectedLang);
    
    // 2. Extraction du nombre de personnes (amélioré)
    entities.guests = await this.extractGuests(rawText, text);
    
    // 3. Extraction du prix
    entities.price = await this.extractPrice(rawText);
    
    // 4. Extraction de la localisation
    entities.locationName = await this.extractLocation(text);
    entities.wantsNearby = await this.extractNearby(text);
    
    // 5. Extraction de la date et heure
    const { date, time } = await this.extractDateTime(rawText, detectedLang);
    entities.date = date;
    entities.time = time;
    
    // 6. Extraction de la note minimum (pour top rated)
    entities.minRating = await this.extractMinRating(rawText);
    
    // 7. Extraction du rayon
    entities.radius = await this.extractRadius(rawText);

    return entities;
  }

  private async extractCategory(text: string, lang: Language): Promise<string | undefined> {
  // Forcer le type pour Object.values
  const categoryDicts = [
    ALL_CATEGORY_KEYWORDS[lang],
    ...Object.values(ALL_CATEGORY_KEYWORDS)
  ] as Record<string, string[]>[];
  
  for (const dict of categoryDicts) {
    if (!dict) continue;
    
    for (const [category, keywords] of Object.entries(dict)) {
      for (const kw of keywords) {
        const nk = normalize(kw);
        if (text.includes(nk) || (!nk.includes(' ') && fuzzyIncludes(text, nk))) {
          return category;
        }
      }
    }
  }
  return undefined;
}

  private async extractGuests(rawText: string, text: string): Promise<number | undefined> {
    // Nombre seul
    const justNumberMatch = rawText.match(GUEST_PATTERNS.regex.justNumber);
    if (justNumberMatch) {
      return parseInt(justNumberMatch[1], 10);
    }
    
    // Pattern standard
    const peopleMatch = rawText.match(GUEST_PATTERNS.regex.withPerson);
    if (peopleMatch) {
      return parseInt(peopleMatch[1], 10);
    }
    
    // "seul" ou équivalent
    if (GUEST_PATTERNS.regex.alone.test(rawText)) {
      return 1;
    }
    
    // Mots nombres dans toutes les langues
    const allNumberWords = {
      ...GUEST_PATTERNS.french,
      ...GUEST_PATTERNS.english,
      ...GUEST_PATTERNS.tunisian,
      ...GUEST_PATTERNS.arabic,
      ...GUEST_PATTERNS.german,
      ...GUEST_PATTERNS.italian,
      ...GUEST_PATTERNS.spanish
    };
    
    for (const [word, num] of Object.entries(allNumberWords)) {
      if (new RegExp(`\\b${word}\\b`, 'i').test(rawText)) {
        return num;
      }
    }
    
    return undefined;
  }

  private async extractPrice(rawText: string): Promise<number | undefined> {
    const pricePatterns = [
      /(\d+(?:[.,]\d+)?)\s*(?:dt|dinar|tnd|euro|eur|€|dollar|usd|\$)/i,
      /(\d+)\s*(?:د\.ت|دينار)/,
      /(?:moins de|max|maximum|jusqu[''à])\s*(\d+)/i,
      /(?:budget|environ|autour de)\s*(\d+)/i
    ];
    
    for (const pattern of pricePatterns) {
      const match = rawText.match(pattern);
      if (match) {
        const val = parseFloat(match[1].replace(',', '.'));
        if (!isNaN(val) && val > 0) return val;
      }
    }
    return undefined;
  }

  private async extractLocation(text: string): Promise<string | undefined> {
    const cities = [
      'tunis', 'sfax', 'sousse', 'monastir', 'bizerte', 'gabes',
      'gafsa', 'kairouan', 'nabeul', 'hammamet', 'djerba', 'tozeur',
      'mahdia', 'zaghouan', 'siliana', 'le kef', 'jendouba', 'beja',
      'medenine', 'tataouine', 'kebili', 'douz', 'ariana', 'la marsa',
      'carthage', 'sidi bou said', 'la goulette', 'manouba', 'ben arous',
      'rades', 'hammam lif'
    ];
    
    for (const city of cities) {
      const nc = normalize(city);
      if (text.includes(nc) || fuzzyIncludes(text, nc)) {
        return city;
      }
    }
    return undefined;
  }

  private async extractNearby(text: string): Promise<boolean> {
    const nearbyPatterns = [
      'pres de moi', 'proche de moi', 'autour de moi', 'dans mon quartier',
      'a proximite', 'dans ma zone', 'ma position', 'ici',
      'near me', 'close to me', 'around me', 'nearby', 'my location',
      'hawali', 'qrib meni', 'grib meni', 'blasi',
      'بالقرب مني', 'حولي', 'في منطقتي', 'هنا'
    ];
    return nearbyPatterns.some(p => text.includes(normalize(p)));
  }

  private async extractDateTime(rawText: string, lang: Language): Promise<{ date?: string; time?: string }> {
    const result: { date?: string; time?: string } = {};
    
    // Extraction de la date
    const dateMatch = rawText.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (dateMatch) {
      result.date = `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`;
    } else {
      // Mots-clés de date selon la langue
      const datePatterns = DATE_PATTERNS[lang] || DATE_PATTERNS.fr;
      for (const pattern of datePatterns) {
        if (pattern.test(rawText)) {
          result.date = pattern.source;
          break;
        }
      }
    }
    
    // Extraction de l'heure
    const timeMatch = rawText.match(/(\d{1,2})\s*[h:]?\s*(\d{0,2})/);
    if (timeMatch) {
      const hour = timeMatch[1];
      const minute = timeMatch[2] || '00';
      result.time = `${hour}h${minute}`;
    }
    
    return result;
  }

  private async extractMinRating(rawText: string): Promise<number | undefined> {
    const ratingPatterns = [
      /(\d+)\s*(?:étoiles|stars|نجوم|etoiles)/i,
      /(\d+)\s*(?:\/)\s*(?:5|10)/,
      /(?:best|top|meilleur|meilleurs|ahsen|أفضل)\s*(?:rated|noté|service)/i
    ];
    
    for (const pattern of ratingPatterns) {
      const match = rawText.match(pattern);
      if (match) {
        if (match[1]) {
          const rating = parseInt(match[1]);
          if (rating >= 1 && rating <= 5) return rating;
        }
        // Si "best" ou "top" sans nombre, retourner 4
        return 4;
      }
    }
    return undefined;
  }

  private async extractRadius(rawText: string): Promise<number> {
    const radiusMatch = rawText.match(/(\d+)\s*(?:km|kilomètres|kilometers)/i);
    if (radiusMatch) {
      return parseInt(radiusMatch[1]);
    }
    return 10; // Rayon par défaut
  }

  detectLanguage(rawText: string, normalizedText?: string): Language {
    const text = normalizedText || normalize(rawText);
    
    // Détection arabe par caractères Unicode
    const arabicChars = (rawText.match(/[\u0600-\u06FF]/g) || []).length;
    const totalChars = rawText.replace(/\s/g, '').length || 1;
    if (arabicChars / totalChars > 0.35) return 'ar';
    
    // Détection par mots-clés
    const scores: Record<Language, number> = {
      fr: 0, en: 0, tn: 0, ar: 0, de: 0, it: 0, es: 0
    };
    
    // Mots caractéristiques par langue
    const langMarkers: Record<Language, string[]> = {
      fr: ['bonjour', 'merci', 'je', 'vous', 'nous', 'est', 'les', 'des', 'une', 'pour'],
      en: ['hello', 'thanks', 'the', 'and', 'for', 'you', 'are', 'this', 'that', 'with'],
      tn: ['ahla', 'beslema', 'nheb', 'wesh', 'nchof', 'labes', 'marhba', 'yalla', 'bch'],
      ar: ['مرحبا', 'شكرا', 'السلام', 'و', 'في', 'من', 'إلى', 'على', 'هذا', 'ذلك'],
      de: ['hallo', 'danke', 'der', 'die', 'das', 'und', 'ist', 'sie', 'wir', 'ich'],
      it: ['ciao', 'grazie', 'il', 'la', 'e', 'è', 'tu', 'noi', 'voi', 'sono'],
      es: ['hola', 'gracias', 'el', 'la', 'y', 'es', 'tu', 'nosotros', 'ellos', 'son']
    };
    
    for (const [lang, markers] of Object.entries(langMarkers)) {
      for (const marker of markers) {
        if (text.includes(normalize(marker))) {
          scores[lang as Language] += 2;
        }
      }
    }
    
    // Langue avec le score le plus élevé
    let bestLang: Language = DEFAULT_LANGUAGE;
    let bestScore = 0;
    for (const [lang, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        bestLang = lang as Language;
      }
    }
    
    return bestLang;
  }

  analyzeSentiment(text: string, lang?: Language): 'positive' | 'negative' | 'neutral' {
    const detectedLang = lang || 'fr';
    let positive = 0, negative = 0;
    
    for (const [l, words] of Object.entries(SENTIMENT_POS)) {
      const weight = l === detectedLang ? 2 : 1;
      for (const word of words) {
        if (text.includes(normalize(word))) positive += weight;
      }
    }
    
    for (const [l, words] of Object.entries(SENTIMENT_NEG)) {
      const weight = l === detectedLang ? 2 : 1;
      for (const word of words) {
        if (text.includes(normalize(word))) negative += weight;
      }
    }
    
    if (positive > negative) return 'positive';
    if (negative > positive) return 'negative';
    return 'neutral';
  }

  async generateResponse(intent: string, entities: any, context?: any): Promise<string> {
    const lang: Language = (entities.detectedLang as Language) || DEFAULT_LANGUAGE;
    
    // Réponses personnalisées selon l'intention
    const responseTemplates: Record<string, Record<Language, string>> = {
      search: {
        fr: `🔍 ${entities.category ? `Je cherche des ${entities.category}s` : 'Je cherche des services'}${entities.locationName ? ` à ${entities.locationName}` : ''}${entities.wantsNearby ? ' près de vous' : ''}...`,
        en: `🔍 ${entities.category ? `Searching for ${entities.category}s` : 'Searching for services'}${entities.locationName ? ` in ${entities.locationName}` : ''}${entities.wantsNearby ? ' near you' : ''}...`,
        tn: `🔍 ${entities.category ? `Nchof ${entities.category}` : 'Nchof services'}${entities.locationName ? ` fi ${entities.locationName}` : ''}${entities.wantsNearby ? ' qribek' : ''}...`,
        ar: `🔍 ${entities.category ? `أبحث عن ${entities.category}` : 'أبحث عن خدمات'}${entities.locationName ? ` في ${entities.locationName}` : ''}${entities.wantsNearby ? ' بالقرب منك' : ''}...`,
        de: `🔍 ${entities.category ? `Suche nach ${entities.category}` : 'Suche nach Dienstleistungen'}${entities.locationName ? ` in ${entities.locationName}` : ''}${entities.wantsNearby ? ' in Ihrer Nähe' : ''}...`,
        it: `🔍 ${entities.category ? `Cerco ${entities.category}` : 'Cerco servizi'}${entities.locationName ? ` a ${entities.locationName}` : ''}${entities.wantsNearby ? ' vicino a te' : ''}...`,
        es: `🔍 ${entities.category ? `Buscando ${entities.category}s` : 'Buscando servicios'}${entities.locationName ? ` en ${entities.locationName}` : ''}${entities.wantsNearby ? ' cerca de ti' : ''}...`
      },
      booking: {
        fr: `📝 Je vais vous aider à réserver. ${entities.guests ? `Pour ${entities.guests} personne(s), ` : ''}${entities.date ? `le ${entities.date} ` : ''}${entities.time ? `à ${entities.time}` : ''}`,
        en: `📝 I'll help you book. ${entities.guests ? `For ${entities.guests} person(s), ` : ''}${entities.date ? `on ${entities.date} ` : ''}${entities.time ? `at ${entities.time}` : ''}`,
        tn: `📝 Na3awnek te7jez. ${entities.guests ? `l ${entities.guests} nafar, ` : ''}${entities.date ? `fi ${entities.date} ` : ''}${entities.time ? `3la ${entities.time}` : ''}`,
        ar: `📝 سأساعدك في الحجز. ${entities.guests ? `لـ ${entities.guests} شخص، ` : ''}${entities.date ? `في ${entities.date} ` : ''}${entities.time ? `الساعة ${entities.time}` : ''}`,
        de: `📝 Ich helfe Ihnen bei der Buchung. ${entities.guests ? `Für ${entities.guests} Person(en), ` : ''}${entities.date ? `am ${entities.date} ` : ''}${entities.time ? `um ${entities.time}` : ''}`,
        it: `📝 Ti aiuto a prenotare. ${entities.guests ? `Per ${entities.guests} persona(e), ` : ''}${entities.date ? `il ${entities.date} ` : ''}${entities.time ? `alle ${entities.time}` : ''}`,
        es: `📝 Te ayudaré a reservar. ${entities.guests ? `Para ${entities.guests} persona(s), ` : ''}${entities.date ? `el ${entities.date} ` : ''}${entities.time ? `a las ${entities.time}` : ''}`
      }
    };
    
    // Retourner la réponse localisée
    if (responseTemplates[intent] && responseTemplates[intent][lang]) {
      return responseTemplates[intent][lang];
    }
    
    // Fallback
    return LOCALIZED_RESPONSES[intent]?.[lang] || LOCALIZED_RESPONSES.welcome[lang] || 'Comment puis-je vous aider ?';
  }

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