// src/modules/ai/services/nlp.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntentResponseDto } from '../dto/ai.dto';

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
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
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

function fuzzyIncludes(text: string, keyword: string): boolean {
  const words = text.split(/\s+/);
  const maxDist = keyword.length <= 4 ? 1 : 2;
  return words.some(w => levenshtein(w, keyword) <= maxDist);
}

const INTENT_KEYWORDS: Record<string, string[]> = {
  search: [
    'cherche','recherche','trouve','trouver','chercher','ou','proche','pres','autour','alentour',
    'disponible','existe','voir','montrer','afficher','lister','liste','quels','quelles','proposer',
    'find','search','look','near','around','show','list','available','where','which','display',
    'fama','fayn','win','wini','wen','wena','feyn','fein',
    'nchof','nchouf','nchuf','chof','chouf','chuf',
    'najjem','najem','njjem','njem',
    'qrib','grib','qriib','griib',
    'hawali','howali','haweli',
    'ena','bch','besh','beche',
    'ابحث','بحث','اجد','فين','وين','فاما','نشوف','قريب','حوالي','موجود','كيفاش','كيفه',
  ],
  booking: [
    'reserver','reservation','reserv','resrevation','resservation','reserrvation','resturant',
    'book','rdv','rendezvous','rendez-vous','commander','commande','prendre','planifier','fixer',
    'avoir','veux','voudrai','voudrais','voudrait','aimerai','aimerais','besoin',
    'table','chambre','place','billet','booking','appointment','schedule','order','want','need','slot',
    'hejez','hejiz','hajez','hjez','hjiz','heji','haji','hji','nheji','nhaji','nhejiz',
    'bch','besh','beche','nheb','nhebb','nhab','nhabb','3andi','andi','a3ndi',
    'mawid','mawad','maw3id','maw3ad','tabla','tebla','tabela',
    'احجز','حجز','احجوزة','حجوزة','موعد','مواعيد','حاجز','نحب','عندي','طاولة',
  ],
  cancel: [
    'annuler','annule','annulation','supprimer','supprime','supression','effacer','enlever','retirer',
    'pas venir','peut pas venir','ne viendra','abandonner','cancel','cancellation','delete','remove',
    "can't come",'wont come',"won't come",'abort','stop',
    'lheg','alheg','batel','btal','btil','batil',
    'ma njiich','manjiich','ma najich','manajich','ma jich','majich','mish ji','mishji',
    'waqef','waqaf','wekf',
    'الغ','الغاء','بطل','حذف','ما نجيش','ما نقدرش','وقف',
  ],
  help: [
    'aide','aider','aidez','comment','quoi','que','quelles','expliquer','expliquez',
    'comprendre','savoir','info','information','instruction','guide','tuto','tutoriel','manuel',
    'help','how','what','explain','assistance','support','understand','tell me',
    '3aweni','3awneni','aweni','awneni',
    'chno','chnowa','shnoa','shnowa','chneya',
    'kifech','kifash','kifesh','kefash','kefesh','kifah','kifeh','kifhe','kif',
    'wesh','wech','wach','fehem','fehim','nfehim','nfehem',
    'ساعدني','عاوني','كيفاش','كيفه','شنوا','كيف','ماذا','علاش','فهم',
  ],
  greeting: [
    'bonjour','bonsoir','bonne nuit','salut','coucou','hello','allo',
    'hi','hey','good morning','good evening','good night','howdy','greetings','sup','yo',
    'ahla','ahlen','salam','slam','slema','marhba','marhaba','marhbik','marhbek',
    'sba7 elkhir','sbah khir','sba7khir','msa elkhir','mesa khir',
    'labas','labes','lbes','keefak','kifak','kifek','keefek',
    'السلام عليكم','سلام','مرحبا','اهلا','صباح الخير','مساء الخير','كيف الحال','لاباس',
  ],
  feedback: [
    'avis','note','noter','evaluer','evaluation','etoile','etoiles','commentaire',
    'commenter','recommande','recommander','feedback','opinion','critique','review','satisfaction',
    'rate','rating','stars','comment','recommend','experience',
    'ra2yi','ra2y','rayo','ra3y','3ajbek','3ajbak','kif lkhidma','kifeh lkhidma',
    'تقييم','رأيي','تعليق','نجوم','كيف الخدمة',
  ],
  goodbye: [
    'au revoir','aurevoir','bye','adieu','bonne journee','bonne soiree','a bientot',
    'ciao','tchao','goodbye','see you','later','take care','cya',
    'beslema','bislama','bisslema','b slema','baraka','braka','yalla','yalllah','yela',
    'مع السلامة','بسلامة','وداعا',
  ],
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  restaurant: [
    'restaurant','resturant','restorant','restoran','resto','restau',
    'manger','repas','dejeuner','diner','nourriture','cuisine','food',
    'cafe','caffet','cafeteria','bistro','brasserie','pizzeria',
    'makla','mekla','nakol','mazel','makal','tajin',
    'مطعم','اكل','طعام','ماكل','ناكل',
  ],
  hotel: [
    'hotel','hotele','hotle','auberge','residence','logement','hebergement',
    'chambre','nuitee','lodging','stay',
    'otil','outil','byet','mahal','ghorfa',
    'فندق','غرفة','اقامة','مبيت',
  ],
  spa: [
    'spa','massage','bien-etre','hammam','sauna','relax','relaxation','detente',
    'soin','beauty','wellness','hmmam','rlaksation',
    'حمام','مساج','استرخاء',
  ],
  gym: [
    'gym','fitness','sport','musculation','salle','entrainement',
    'workout','yoga','pilates','crossfit',
    'sala sport','sportsala','tmarran','tmaren',
    'رياضة','صالة','تمارين',
  ],
  salon: [
    'coiffeur','coiffeuse','salon','barbier','barber','beaute',
    'coupe','coiffure','hair','ongle','manucure',
    'hajjem','hejjem','hajjam','salle beaute',
    'حلاق','صالون','تجميل',
  ],
};

const TUNISIAN_CITIES = [
  'tunis','sousse','sfax','monastir','nabeul','hammamet','djerba','kairouan',
  'bizerte','gabes','gafsa','tozeur','mahdia','zaghouan','siliana','le kef',
  'jendouba','beja','ariana','manouba','ben arous','carthage','sidi bouzid',
  'medenine','tataouine','kebili',
];

@Injectable()
export class NlpService {
  private readonly logger = new Logger(NlpService.name);

  constructor(private configService: ConfigService) {}

  async analyzeIntent(rawText: string): Promise<IntentResponseDto> {
    const text = normalize(rawText);

    let bestIntent = 'unknown';
    let bestScore = 0;

    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
      let score = 0;
      for (const keyword of keywords) {
        const nk = normalize(keyword);
        if (text.includes(nk)) { score += 3; continue; }
        if (!nk.includes(' ') && fuzzyIncludes(text, nk)) { score += 2; continue; }
        if (nk.includes(' ') && this.ngramMatch(text, nk)) { score += 2; }
      }
      if (score > bestScore) { bestScore = score; bestIntent = intent; }
    }

    if (bestScore < 2) bestIntent = 'unknown';

    const entities = await this.extractEntities(rawText, text);
    const sentiment = this.analyzeSentiment(text);
    const confidence = Math.min(0.95, bestScore / 10);

    return { intent: bestIntent, confidence, entities, sentiment };
  }

  private ngramMatch(text: string, phrase: string): boolean {
    const pw = phrase.split(' '), tw = text.split(' ');
    for (let i = 0; i <= tw.length - pw.length; i++) {
      const chunk = tw.slice(i, i + pw.length).join(' ');
      if (levenshtein(chunk, phrase) <= 2) return true;
    }
    return false;
  }

  async extractEntities(rawText: string, normalizedText?: string): Promise<any> {
    const text = normalizedText || normalize(rawText);
    const entities: any = {};

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      for (const kw of keywords) {
        const nk = normalize(kw);
        if (text.includes(nk) || fuzzyIncludes(text, nk)) { entities.category = category; break; }
      }
      if (entities.category) break;
    }

    const priceMatch = text.match(/(\d+)\s*(?:dt|dinar|tnd|euro|€|\$)?/i);
    if (priceMatch && parseInt(priceMatch[1]) > 0) entities.price = parseInt(priceMatch[1], 10);

    const peopleMatch = text.match(/(\d+)\s*(?:personnes?|gens?|pax|nafar|نفر|اشخاص)/i);
    if (peopleMatch) entities.guests = parseInt(peopleMatch[1], 10);

    for (const city of TUNISIAN_CITIES) {
      if (text.includes(city) || fuzzyIncludes(text, city)) { entities.locationName = city; break; }
    }

    const timePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{4})/,
      /(\d{1,2})\s*[h:]\s*(\d{0,2})/,
      /demain|tomorrow|ghudwa|غدوا|غدا/i,
      /ce soir|tonight|llila|الليلة/i,
      /aujourd'hui|today|lyoum|اليوم/i,
    ];
    for (const p of timePatterns) {
      const m = rawText.match(p);
      if (m) { entities.timeReference = m[0]; break; }
    }

    const nearPatterns = ['pres de moi','proche de moi','near me','hawali','qrib meni','grib meni','قريب مني','حوالي'];
    entities.wantsNearby = nearPatterns.some(p => text.includes(normalize(p)));

    return entities;
  }

  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const pos = ['bon','super','excellent','genial','parfait','bien','content','satisfait','merci',
                 'good','great','nice','love','bravo','mzyan','mezian','behi','bahi','مزيان','ممتاز','شكرا'];
    const neg = ['mauvais','terrible','horrible','decu','probleme','erreur','insatisfait','dommage',
                 'bad','awful','hate','wrong','khaib','خايب','وحش'];
    let p = 0, n = 0;
    for (const w of pos) if (text.includes(w)) p++;
    for (const w of neg) if (text.includes(w)) n++;
    if (p > n) return 'positive';
    if (n > p) return 'negative';
    return 'neutral';
  }

  async generateResponse(intent: string, entities: any, context?: any): Promise<string> {
    const map: Record<string, () => string> = {
      search:   () => { let r = 'Je cherche '; if (entities.category) r += `des ${entities.category}s `; if (entities.locationName) r += `à ${entities.locationName} `; return r + ': voici les résultats.'; },
      booking:  () => { let r = 'Je vous aide à réserver. '; if (entities.category) r += `Pour un ${entities.category}, `; return r + 'quand souhaitez-vous venir ?'; },
      cancel:   () => context?.hasReservations ? 'Laquelle souhaitez-vous annuler ?' : "Pas de réservation active.",
      help:     () => '🤖 Tapez **aide** pour voir les commandes disponibles.',
      greeting: () => ['Bonjour! Kifeh nel3awnek?','Hello! How can I help?','أهلاً! كيفاش نعاونك؟'][Math.floor(Math.random()*3)],
      feedback: () => 'Merci ! Pour quel service voulez-vous laisser un avis ?',
      goodbye:  () => ['Au revoir!','Beslema!','مع السلامة!'][Math.floor(Math.random()*3)],
    };
    return (map[intent] ?? map.help)();
  }
}