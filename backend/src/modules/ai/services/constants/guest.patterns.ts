// src/modules/ai/constants/guest.patterns.ts

export interface NumberMapping {
  [key: string]: number;
}

// Mots nombres pour toutes les langues
export const GUEST_PATTERNS = {
  // Patterns regex pour la détection
  regex: {
    // Nombre seul
    justNumber: /^(\d+)$/,
    
    // Nombre avec mot "personne"
    withPerson: /(\d+)\s*(?:personnes?|gens?|pax|convives?|nafar|nefar|نفر|اشخاص|شخص|أشخاص|people|persons?|guests?|covers?|individus?|adultes?|enfants?)/i,
    
    // "seul" et variantes
  alone: /\b(seul(?:e)?|un\s+seul|une\s+seule|tout\s*seul|by\s*myself|alone|wa7ed|واحد|وحيد)\b/i,    
    // "un" seul
    one: /\b(un|une|one|واحد|wa7ed)\s*(?!personne|person|nafar)/i,
    
    // Fourchette de nombres
    range: /(\d+)\s*[-à]\s*(\d+)\s*(?:personnes?|gens?|nafar)/i,
    
    // Au moins X personnes
    atLeast: /(?:au\s*moins|minimum|at\s*least|على الأقل)\s*(\d+)\s*(?:personnes?|nafar)/i,
    
    // Maximum X personnes
    atMost: /(?:au\s*maximum|maximum|at\s*most|على الأكثر)\s*(\d+)\s*(?:personnes?|nafar)/i,
  },
  
  // Mots nombres - Français
  french: {
    'un': 1, 'une': 1, 'deux': 2, 'trois': 3, 'quatre': 4, 'cinq': 5,
    'six': 6, 'sept': 7, 'huit': 8, 'neuf': 9, 'dix': 10,
    'onze': 11, 'douze': 12, 'treize': 13, 'quatorze': 14, 'quinze': 15,
    'seize': 16, 'vingt': 20, 'trente': 30, 'quarante': 40, 'cinquante': 50
  },
  
  // Mots nombres - Anglais
  english: {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
    'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20
  },
  
  // Mots nombres - Tunisien/Darija
  tunisian: {
    'wa7ed': 1, 'wahid': 1, 'thnayn': 2, 'thnej': 2, 'thelatha': 3,
    'tlata': 3, 'arb3a': 4, 'khamsa': 5, 'sitta': 6, 'sab3a': 7,
    'thamanya': 8, 'tmanya': 8, 'tis3a': 9, '3achra': 10,
    'حداش': 11,  'طوناش': 12, 'ثلتاش': 13, 'ربعتاش': 14, 'خمسطاش': 15,
    'ستطاش': 16, 'سبعتاش': 17, 'ثمانطاش': 18, 'تسعتاش': 19, 'عشرين': 20
  },
  
  // Mots nombres - Arabe
  arabic: {
    'واحد': 1, 'واحدة': 1, 'اثنان': 2, 'اثنين': 2, 'ثلاثة': 3,
    'أربعة': 4, 'خمسة': 5, 'ستة': 6, 'سبعة': 7, 'ثمانية': 8,
    'تسعة': 9, 'عشرة': 10, 'أحد': 1, 'إحدى': 1
  },
  
  // Mots nombres - Allemand
  german: {
    'eins': 1, 'eine': 1, 'zwei': 2, 'drei': 3, 'vier': 4,
    'fünf': 5, 'sechs': 6, 'sieben': 7, 'acht': 8, 'neun': 9, 'zehn': 10
  },
  
  // Mots nombres - Italien
  italian: {
    'uno': 1, 'una': 1, 'due': 2, 'tre': 3, 'quattro': 4,
    'cinque': 5, 'sei': 6, 'sette': 7, 'otto': 8, 'nove': 9, 'dieci': 10
  },
  
  // Mots nombres - Espagnol
  spanish: {
    'uno': 1, 'una': 1, 'dos': 2, 'tres': 3, 'cuatro': 4,
    'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10
  }
};

// Types de nombres
export const GUEST_TYPES = {
  EXACT: 'exact',
  RANGE: 'range',
  MIN: 'min',
  MAX: 'max',
  UNKNOWN: 'unknown'
} as const;

export type GuestType = typeof GUEST_TYPES[keyof typeof GUEST_TYPES];