// src/modules/ai/constants/language.constants.ts
// ═══════════════════════════════════════════════════════════════════════════
//  DICTIONNAIRES LINGUISTIQUES MULTILINGUES COMPLETS
//  Langues : FR, EN, TN, AR, DE, IT, ES
// ═══════════════════════════════════════════════════════════════════════════

export type Language = 'fr' | 'en' | 'tn' | 'ar' | 'de' | 'it' | 'es';

// ============================================
// INTENT KEYWORDS - FRANÇAIS
// ============================================
export const INTENT_KEYWORDS_FR: Record<string, string[]> = {
  search: [
    'cherche', 'recherche', 'trouver', 'trouve', 'chercher', 'rechercher',
    'je cherche', 'je recherche', 'j\'cherche', 'j\'recherche',
    'où est', 'où se trouve', 'ou puis-je', 'ou peut-on',
    'voir', 'montrer', 'afficher', 'lister', 'quels sont', 'quelles sont',
    'proche', 'près', 'alentour', 'autour', 'à proximité',
    'pas loin', 'juste à côté', 'dans le coin', 'dans le quartier',
    'disponible', 'ouvert', 'libre', 'existe', 'il y a',
    'suggérer', 'conseiller', 'recommander', 'proposer'
  ],
  booking: [
    'réserver', 'réservation', 'booker', 'commander', 'prendre',
    'je veux réserver', 'je voudrais réserver', 'j\'aimerais réserver',
    'faire une réservation', 'prendre un rdv', 'prendre rendez-vous',
    'planifier', 'programmer', 'fixer', 'caler',
    'table', 'chambre', 'place', 'billet', 'ticket',
    'confirmer', 'valider', 'ok pour', 'd\'accord pour'
  ],
  cancel: [
    'annuler', 'annulation', 'supprimer', 'effacer', 'enlever',
    'j\'annule', 'je veux annuler', 'je voudrais annuler',
    'annuler ma réservation', 'annuler mon rdv',
    'pas venir', 'ne peux pas venir', 'je ne viendrai pas',
    'annulation sans frais', 'rembourser', 'remboursement',
    'modifier', 'changer', 'reporter', 'décaler'
  ],
  modify: [
    'modifier', 'changer', 'reporter', 'décaler', 'ajuster',
    'changer la date', 'changer l\'heure', 'modifier ma réservation',
    'reprogrammer', 'déplacer', 'avancer', 'reculer'
  ],
  help: [
    'aide', 'aider', 'assistance', 'support', 'guide',
    'comment ça marche', 'comment faire', 'comment utiliser',
    'que peux-tu faire', 'tes fonctions', 'commande', 'instructions',
    'j\'ai besoin d\'aide', 'pouvez-vous m\'aider'
  ],
  greeting: [
    'bonjour', 'bonsoir', 'salut', 'coucou', 'hello', 'hey',
    'bonne journée', 'bonne soirée', 'comment ça va', 'ça va',
    'ravi de vous voir', 'content de vous parler'
  ],
  feedback: [
    'avis', 'donner mon avis', 'laisser un avis', 'note', 'noter',
    'étoile', 'étoiles', 'commentaire', 'commenter',
    'évaluation', 'évaluer', 'retour', 'retour d\'expérience',
    'satisfait', 'insatisfait', 'recommande', 'déconseille'
  ],
  goodbye: [
    'au revoir', 'aurevoir', 'à bientôt', 'à plus', 'à la prochaine',
    'bye', 'ciao', 'tchao', 'salut', 'bonne journée', 'à tout à l\'heure'
  ],
  nearby: [
    'près de moi', 'proche de moi', 'autour de moi', 'dans mon quartier',
    'à côté de chez moi', 'à proximité', 'dans les environs',
    'à deux pas', 'pas loin d\'ici'
  ],
  top_rated: [
    'meilleur', 'mieux noté', 'top', 'le mieux', 'le plus populaire',
    'le plus recommandé', 'le mieux noté', 'étoilé', '5 étoiles',
    'excellent', 'exceptionnel', 'très bien noté'
  ],
  recommend: [
    'recommande', 'conseille', 'suggère', 'propose', 'idée',
    'que me conseilles-tu', 'suggestions', 'coup de cœur'
  ],
  price: [
    'prix', 'tarif', 'combien', 'coût', 'budget', 'gratuit', 'payant',
    'moins cher', 'cher', 'économique', 'luxe'
  ]
};

// ============================================
// INTENT KEYWORDS - ENGLISH
// ============================================
export const INTENT_KEYWORDS_EN: Record<string, string[]> = {
  search: [
    'find', 'search', 'look for', 'seek', 'discover', 'locate',
    'i need', 'i want to find', 'i am looking for', 'can you find',
    'where is', 'where can i', 'show me', 'display', 'list',
    'near', 'nearby', 'close to', 'around me', 'in my area',
    'available', 'open', 'is there', 'are there'
  ],
  booking: [
    'book', 'booking', 'reserve', 'reservation', 'order',
    'i want to book', 'i would like to book', 'can i book',
    'make a reservation', 'schedule', 'set up', 'arrange',
    'table', 'room', 'seat', 'ticket', 'slot', 'appointment'
  ],
  cancel: [
    'cancel', 'cancellation', 'delete', 'remove', 'undo',
    'i want to cancel', 'i would like to cancel', 'can i cancel',
    'not coming', 'cannot come', 'won\'t make it', 'reschedule'
  ],
  modify: [
    'modify', 'change', 'reschedule', 'update', 'adjust',
    'change date', 'change time', 'move', 'postpone', 'bring forward'
  ],
  help: [
    'help', 'assist', 'support', 'guide', 'how to', 'tutorial',
    'what can you do', 'commands', 'instructions', 'i need help'
  ],
  greeting: [
    'hello', 'hi', 'hey', 'good morning', 'good afternoon',
    'good evening', 'how are you', 'what\'s up', 'greetings'
  ],
  feedback: [
    'review', 'rate', 'rating', 'star', 'comment', 'feedback',
    'leave a review', 'give feedback', 'testimonial', 'opinion'
  ],
  goodbye: [
    'goodbye', 'bye', 'see you', 'later', 'farewell', 'take care',
    'have a nice day', 'see you later', 'cya'
  ],
  nearby: [
    'near me', 'close to me', 'around me', 'in my neighborhood',
    'within walking distance', 'nearby', 'close by'
  ],
  top_rated: [
    'best', 'top rated', 'highest rated', 'top', 'popular',
    'best reviewed', 'recommended', '5 star', 'excellent'
  ],
  recommend: [
    'recommend', 'suggest', 'advise', 'propose', 'recommendations',
    'what do you suggest', 'any suggestions', 'pick for me'
  ],
  price: [
    'price', 'cost', 'how much', 'budget', 'cheap', 'expensive',
    'free', 'affordable', 'luxury', 'economy'
  ]
};

// ============================================
// INTENT KEYWORDS - TUNISIEN/DARIJA
// ============================================
export const INTENT_KEYWORDS_TN: Record<string, string[]> = {
  search: [
    'nchof', 'nchouf', 'chouf', 'nlaqqa', 'nlaqa', 'n7ott',
    'win', 'fayn', 'wein', 'wini', 'fama', 'kayen',
    'qrib', 'grib', 'hawali', 'qrib meni', 'grib meni',
    'warrini', 'a3tini', 'ktibli', '7ottli', 'warini'
  ],
  booking: [
    'hejez', 'hajez', 'nhejez', 'nheji', '7ejjez', 'tlab',
    'nheb nhejez', 'nheb njiw', 'commanda', 'commandili',
    'mawid', 'tabla', 'bit', 'blas', 'mekda', 'kursi'
  ],
  cancel: [
    'lheg', 'batel', 'nbatel', 'nheg', 'lheg el', 'elheg',
    'ma njiich', 'ma najich', 'ma jich', 'majich',
    'waqef', 'emseh', 'mseh', 'enhiha', 'shilha'
  ],
  modify: [
    'baadel', 'badel', 'baddel', 'baddalou', 'baddilha',
    'badel waqt', 'badel tarikh', 'ghayyir', 'beddel'
  ],
  help: [
    '3aweni', '3awneni', 'sa3edni', 'a3weni', 'mosa3da',
    'fehemni', '3arrefni', 'khabberni', 'dellni', 'wjehni'
  ],
  greeting: [
    'ahla', 'ahlen', 'salam', 'slema', 'marhba', 'labas',
    'sba7 elkhir', 'msa elkhir', 'kifeh', 'kifak', 'kifech'
  ],
  feedback: [
    'ra2yi', 'ra2y', 'nota', 'notili', 'nnoti', '3tini ra2yek',
    'chnowa ra2yek', 'ta3li9', 'ta3li9a', 'najem'
  ],
  goodbye: [
    'beslema', 'bislema', 'yalla', 'nrawah', 'nrawahk',
    'tsbah 3la kher', 'tmessha bkhir', 'n9aw lahna'
  ],
  nearby: [
    'qrib meni', 'grib meni', 'hawali', 'fi hwali', 'blasi',
    'fi blesti', 'qribna', 'gribna', 'fi lhouma'
  ],
  top_rated: [
    'ahsen', 'mzyan barcha', 'ta7i', 'zorba', 'khatr',
    'qawi', 'a7la 7aja', 'behi barcha', 'mli7'
  ],
  recommend: [
    'nsi7', 'nsa7', '3tini ra2yek', 'chnowa tnsa7ni bih',
    'wa7ed mli7', 'recommande', 'nsay7ek'
  ],
  price: [
    'flous', 'chnowa thamen', 'b qadech', 'ghali', 'rkhiis',
    'zeyed', 'mch 9awi', 'barcha', 'so8ayar'
  ]
};

// ============================================
// INTENT KEYWORDS - ARABE
// ============================================
export const INTENT_KEYWORDS_AR: Record<string, string[]> = {
  search: [
    'ابحث', 'ابحث عن', 'بحث', 'أجد', 'أريد أن أجد', 'هل يوجد',
    'أين', 'أين يوجد', 'اعرض', 'أظهر', 'أرني', 'قائمة',
    'قريب', 'بالقرب مني', 'حولي', 'في منطقتي', 'متاح', 'موجود', 'مفتوح'
  ],
  booking: [
    'احجز', 'احجز لي', 'حجز', 'حجوزة', 'الحجز', 'أريد حجز', 'أريد أن احجز',
    'موعد', 'حدد موعد', 'طلب', 'اطلب', 'طاولة', 'غرفة', 'مكان', 'مقعد'
  ],
  cancel: [
    'الغ', 'الغاء', 'الغ حجزي', 'الغاء الحجز', 'أريد الإلغاء', 'أريد أن ألغي',
    'احذف', 'حذف', 'لن أحضر', 'لا أستطيع الحضور', 'لن أتمكن'
  ],
  modify: [
    'عدل', 'غير', 'غير موعدي', 'اجل', 'اجل موعدي', 'غير التاريخ', 'غير الوقت'
  ],
  help: [
    'ساعدني', 'ساعد', 'مساعدة', 'أحتاج مساعدة', 'كيف', 'كيف يمكن', 'ماذا',
    'اشرح لي', 'وضح لي', 'فهمني', 'معلومات', 'تفاصيل'
  ],
  greeting: [
    'السلام عليكم', 'مرحبا', 'اهلا', 'صباح الخير', 'مساء الخير', 'كيف الحال'
  ],
  feedback: [
    'تقييم', 'رأيي', 'رأي', 'تعليق', 'أريد تقييم', 'أقيم', 'نجوم', 'ممتاز', 'جيد', 'سيء'
  ],
  goodbye: [
    'مع السلامة', 'وداعا', 'الى اللقاء', 'باي', 'بسلامة', 'الله يسلمك'
  ],
  nearby: [
    'بالقرب مني', 'قريب مني', 'حولي', 'في منطقتي', 'بجواري', 'في محيطي'
  ],
  top_rated: [
    'أفضل', 'أعلى تقييم', 'ممتاز', 'خمس نجوم', 'الأكثر شهرة', 'الموصى به'
  ],
  recommend: [
    'أوصي', 'اقترح', 'انصح', 'ماذا تنصحني', 'اقتراحات', 'توصيات'
  ],
  price: [
    'سعر', 'تكلفة', 'كم', 'ميزانية', 'رخيص', 'غالي', 'مجاني'
  ]
};

// ============================================
// INTENT KEYWORDS - ALLEMAND
// ============================================
export const INTENT_KEYWORDS_DE: Record<string, string[]> = {
  search: ['suchen', 'finden', 'wo ist', 'zeige mir', 'in der Nähe', 'verfügbar'],
  booking: ['buchen', 'reservierung', 'ich möchte buchen', 'tisch', 'zimmer', 'termin'],
  cancel: ['stornieren', 'annullieren', 'löschen', 'absagen', 'nicht kommen'],
  help: ['hilfe', 'assistenz', 'wie funktioniert', 'was kannst du'],
  greeting: ['hallo', 'guten tag', 'guten abend', 'guten morgen', 'servus', 'moin'],
  goodbye: ['auf wiedersehen', 'tschüss', 'bis bald', 'ciao'],
  nearby: ['in meiner nähe', 'um mich herum', 'nebenan'],
  top_rated: ['am besten', 'top bewertet', '5 sterne', 'ausgezeichnet'],
  recommend: ['empfehlen', 'vorschlagen', 'tipp', 'idee']
};

// ============================================
// INTENT KEYWORDS - ITALIEN
// ============================================
export const INTENT_KEYWORDS_IT: Record<string, string[]> = {
  search: ['cercare', 'trova', 'dov\'è', 'mostrami', 'vicino', 'disponibile'],
  booking: ['prenotare', 'prenotazione', 'vorrei prenotare', 'tavolo', 'camera'],
  cancel: ['cancellare', 'annullare', 'eliminare', 'non posso venire'],
  help: ['aiuto', 'assistenza', 'come funziona', 'cosa puoi fare'],
  greeting: ['ciao', 'buongiorno', 'buonasera', 'salve', 'buondì'],
  goodbye: ['arrivederci', 'ciao', 'a presto', 'addio'],
  nearby: ['vicino a me', 'intorno a me', 'nelle vicinanze'],
  top_rated: ['migliore', 'più votato', '5 stelle', 'eccellente'],
  recommend: ['consigliare', 'suggerire', 'raccomandare', 'idea']
};

// ============================================
// INTENT KEYWORDS - ESPAGNOL
// ============================================
export const INTENT_KEYWORDS_ES: Record<string, string[]> = {
  search: ['buscar', 'encontrar', 'dónde está', 'muéstrame', 'cerca', 'disponible'],
  booking: ['reservar', 'reserva', 'quiero reservar', 'mesa', 'habitación'],
  cancel: ['cancelar', 'anular', 'eliminar', 'no puedo venir'],
  help: ['ayuda', 'asistencia', 'cómo funciona', 'qué puedes hacer'],
  greeting: ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'saludos'],
  goodbye: ['adiós', 'chao', 'hasta luego', 'hasta pronto'],
  nearby: ['cerca de mí', 'a mi alrededor', 'en mi zona'],
  top_rated: ['mejor', 'mejor valorado', '5 estrellas', 'excelente'],
  recommend: ['recomendar', 'sugerir', 'aconsejar', 'idea']
};

// ============================================
// CATEGORY KEYWORDS MULTILINGUES
// ============================================
export const CATEGORY_KEYWORDS_FR: Record<string, string[]> = {
  restaurant: ['restaurant', 'resto', 'manger', 'repas', 'cuisine', 'gastronomie', 'brasserie', 'bistro', 'pizzeria'],
  hotel: ['hôtel', 'hotel', 'logement', 'hébergement', 'chambre', 'nuitée', 'séjour', 'auberge'],
  spa: ['spa', 'hammam', 'massage', 'bien-être', 'détente', 'relaxation', 'soin', 'sauna', 'jacuzzi'],
  gym: ['gym', 'salle de sport', 'fitness', 'musculation', 'yoga', 'pilates', 'crossfit'],
  salon: ['coiffeur', 'salon de coiffure', 'barbier', 'manucure', 'pédicure', 'beauté'],
  clinic: ['clinique', 'médecin', 'dentiste', 'pharmacie', 'cabinet médical', 'laboratoire'],
  event: ['événement', 'event', 'soirée', 'mariage', 'anniversaire', 'fête', 'conférence']
};

export const CATEGORY_KEYWORDS_EN: Record<string, string[]> = {
  restaurant: ['restaurant', 'eatery', 'food', 'meal', 'dinner', 'lunch', 'breakfast', 'cafe'],
  hotel: ['hotel', 'accommodation', 'lodging', 'room', 'stay', 'inn', 'hostel'],
  spa: ['spa', 'massage', 'wellness', 'relaxation', 'sauna', 'jacuzzi', 'treatment'],
  gym: ['gym', 'fitness', 'workout', 'exercise', 'yoga', 'pilates', 'training'],
  salon: ['salon', 'hairdresser', 'barber', 'beauty', 'nails', 'makeup'],
  clinic: ['clinic', 'doctor', 'dentist', 'pharmacy', 'medical', 'healthcare'],
  event: ['event', 'party', 'wedding', 'birthday', 'celebration', 'conference']
};

export const CATEGORY_KEYWORDS_TN: Record<string, string[]> = {
  restaurant: ['restaurant', 'makla', 'nakol', 'tajin', 'couscous', 'pizza', 'burger'],
  hotel: ['hotel', 'otil', 'bit', 'ghorfa', 'manzal', 'dar', 'byet'],
  spa: ['hammam', 'spa', 'massage', 'rla9sa', 'detant', 'ra7a', 'soin'],
  gym: ['sala sport', 'gym', 'fitness', 'tmarran', 'sport', 'riyadha'],
  salon: ['hajjem', 'salon', 'coiffeur', 'tresser', 'qass', '7ela9a'],
  clinic: ['clinique', 'tbib', 'doctor', 'spitar', 'moustachfa', 'dokteur'],
  event: ['3ars', 'far7a', 'festa', 'hafla', 'concert', 'soiree']
};

export const CATEGORY_KEYWORDS_AR: Record<string, string[]> = {
  restaurant: ['مطعم', 'اكل', 'طعام', 'وجبة', 'غداء', 'عشاء', 'كافيه'],
  hotel: ['فندق', 'اقامة', 'غرفة', 'نوم', 'سكن', 'نزل', 'ريزيدانس'],
  spa: ['سبا', 'حمام', 'مساج', 'استرخاء', 'هدوء', 'عناية'],
  gym: ['جيم', 'صالة رياضية', 'رياضة', 'تمارين', 'لياقة', 'يوجا'],
  salon: ['صالون', 'حلاق', 'كوافير', 'تجميل', 'مناكير', 'قص شعر'],
  clinic: ['عيادة', 'طبيب', 'مستشفى', 'دكتور', 'علاج', 'صيدلية'],
  event: ['حفل', 'مناسبة', 'عرس', 'زفاف', 'عيد', 'مؤتمر']
};

// ============================================
// SENTIMENT LEXICONS MULTILINGUES
// ============================================
export const SENTIMENT_POS: Record<Language, string[]> = {
  fr: ['bon', 'bien', 'super', 'excellent', 'parfait', 'génial', 'formidable', 'magnifique', 'top', 'content', 'satisfait', 'merci', 'bravo', 'parfait'],
  en: ['good', 'great', 'excellent', 'perfect', 'awesome', 'amazing', 'wonderful', 'fantastic', 'nice', 'love', 'happy', 'satisfied', 'thanks'],
  tn: ['mzyan', 'behi', 'ta7i', 'zorba', 'khatr', 'qawi', 'mli7', 'zwina', 'e7la', 'a7la', 'bravo', 'merci', 'chokran'],
  ar: ['جيد', 'ممتاز', 'رائع', 'جميل', 'ممتازة', 'رائعة', 'شكرا', 'أحسنت', 'راضي', 'سعيد', 'مبسوط'],
  de: ['gut', 'super', 'ausgezeichnet', 'perfekt', 'toll', 'fantastisch', 'danke', 'zufrieden'],
  it: ['buono', 'ottimo', 'eccellente', 'perfetto', 'fantastico', 'grazie', 'soddisfatto'],
  es: ['bueno', 'excelente', 'perfecto', 'genial', 'fantástico', 'gracias', 'satisfecho']
};

export const SENTIMENT_NEG: Record<Language, string[]> = {
  fr: ['mauvais', 'nul', 'terrible', 'horrible', 'déçu', 'insatisfait', 'problème', 'erreur', 'lent', 'cher', 'arnaque', 'dommage'],
  en: ['bad', 'terrible', 'horrible', 'awful', 'disappointed', 'unsatisfied', 'problem', 'error', 'slow', 'expensive', 'scam'],
  tn: ['khayeb', 'khaib', 'mich mzyan', 'mich behi', 'wahesh', 'khsar', 'ghali', 'batel', 'mayeslach'],
  ar: ['سيء', 'رديء', 'فظيع', 'مخيب', 'غير راضي', 'خطأ', 'بطيء', 'غالي', 'نصب'],
  de: ['schlecht', 'furchtbar', 'enttäuscht', 'Problem', 'Fehler', 'langsam', 'teuer'],
  it: ['cattivo', 'terribile', 'deluso', 'insoddisfatto', 'problema', 'errore', 'lento', 'caro'],
  es: ['malo', 'terrible', 'decepcionado', 'insatisfecho', 'problema', 'error', 'lento', 'caro']
};

// ============================================
// LOCALIZED RESPONSES MULTILINGUES
// ============================================
export const LOCALIZED_RESPONSES: Record<string, Record<Language, string>> = {
  welcome: {
    fr: '👋 Bonjour ! Je suis votre assistant Reservia. Comment puis-je vous aider ?',
    en: '👋 Hello! I\'m your Reservia assistant. How can I help you?',
    tn: '👋 Ahla bik! Ena m3awnek Reservia. Kifeh n3awnek?',
    ar: '👋 مرحبا! أنا مساعدك في ريزيرفيا. كيف يمكنني مساعدتك؟',
    de: '👋 Hallo! Ich bin Ihr Reservia-Assistent. Wie kann ich helfen?',
    it: '👋 Ciao! Sono il tuo assistente Reservia. Come posso aiutarti?',
    es: '👋 ¡Hola! Soy tu asistente de Reservia. ¿Cómo puedo ayudarte?'
  },
  booking_start: {
    fr: '📝 Je vais vous aider à réserver "{serviceName}". Pour combien de personnes ?',
    en: '📝 I\'ll help you book "{serviceName}". For how many people?',
    tn: '📝 Na3awnek te7jez "{serviceName}". 3la qadech nafar?',
    ar: '📝 سأساعدك في حجز "{serviceName}". لكم شخص؟',
    de: '📝 Ich helfe Ihnen, "{serviceName}" zu buchen. Für wie viele Personen?',
    it: '📝 Ti aiuto a prenotare "{serviceName}". Per quante persone?',
    es: '📝 Te ayudaré a reservar "{serviceName}". ¿Para cuántas personas?'
  },
  ask_guests: {
    fr: '👥 Combien de personnes serez-vous ? (dites un nombre : 1, 2, 3...)',
    en: '👥 How many people? (say a number: 1, 2, 3...)',
    tn: '👥 3la qadech nafar? (qol raqm: 1, 2, 3...)',
    ar: '👥 كم شخص؟ (قل رقماً: 1، 2، 3...)',
    de: '👥 Wie viele Personen? (Sagen Sie eine Zahl: 1, 2, 3...)',
    it: '👥 Quante persone? (di\' un numero: 1, 2, 3...)',
    es: '👥 ¿Cuántas personas? (diga un número: 1, 2, 3...)'
  },
  ask_date: {
    fr: '📅 Quelle date souhaitez-vous ? (ex: demain, 25/12/2024, lundi prochain)',
    en: '📅 What date would you like? (ex: tomorrow, 12/25/2024, next Monday)',
    tn: '📅 Wa9teh teb9a tji? (mthel: ghudwa, 25/12/2024, lundi jay)',
    ar: '📅 ما التاريخ الذي تريده؟ (مثال: غداً، 25/12/2024، الاثنين القادم)',
    de: '📅 Welches Datum wünschen Sie? (z.B. morgen, 25.12.2024, nächsten Montag)',
    it: '📅 Che data desideri? (es: domani, 25/12/2024, lunedì prossimo)',
    es: '📅 ¿Qué fecha desea? (ej: mañana, 25/12/2024, próximo lunes)'
  },
  ask_time: {
    fr: '⏰ À quelle heure ? (ex: 20h, 14h30, 9h)',
    en: '⏰ At what time? (ex: 8pm, 2:30pm, 9am)',
    tn: '⏰ 3la waqteh? (mthel: 20h, 14h30, 9h)',
    ar: '⏰ في أي ساعة؟ (مثال: 8 مساءً، 2:30 ظهراً، 9 صباحاً)',
    de: '⏰ Um wie viel Uhr? (z.B. 20 Uhr, 14:30 Uhr, 9 Uhr)',
    it: '⏰ A che ora? (es: 20:00, 14:30, 9:00)',
    es: '⏰ ¿A qué hora? (ej: 20h, 14:30h, 9h)'
  },
  booking_confirmed: {
    fr: '✅ Réservation confirmée !\n\n📅 {date} à {time}\n👥 {guests} personne(s)\n\n📧 Un email de confirmation vous a été envoyé.',
    en: '✅ Booking confirmed!\n\n📅 {date} at {time}\n👥 {guests} person(s)\n\n📧 A confirmation email has been sent.',
    tn: '✅ Hejzek mzabt!\n\n📅 {date} 3la {time}\n👥 {guests} nafar\n\n📧 Email tawkid mchalk.',
    ar: '✅ تم تأكيد الحجز!\n\n📅 {date} الساعة {time}\n👥 {guests} شخص\n\n📧 تم إرسال بريد تأكيد.',
    de: '✅ Buchung bestätigt!\n\n📅 {date} um {time}\n👥 {guests} Person(en)\n\n📧 Eine Bestätigungs-E-Mail wurde gesendet.',
    it: '✅ Prenotazione confermata!\n\n📅 {date} alle {time}\n👥 {guests} persona(e)\n\n📧 Un\'email di conferma è stata inviata.',
    es: '✅ ¡Reserva confirmada!\n\n📅 {date} a las {time}\n👥 {guests} persona(s)\n\n📧 Se ha enviado un correo de confirmación.'
  },
  login_required: {
    fr: '🔐 Veuillez vous connecter pour effectuer cette action.',
    en: '🔐 Please log in to perform this action.',
    tn: '🔐 A3mel login bech ta3mel hethi.',
    ar: '🔐 سجل الدخول للقيام بهذا الإجراء.',
    de: '🔐 Bitte melden Sie sich an, um diese Aktion durchzuführen.',
    it: '🔐 Effettua il login per eseguire questa azione.',
    es: '🔐 Inicia sesión para realizar esta acción.'
  }
};

// ============================================
// DATE & TIME PATTERNS MULTILINGUES
// ============================================
export const DATE_PATTERNS: Record<Language, RegExp[]> = {
  fr: [/demain/i, /aujourd'hui/i, /ce soir/i, /lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche/i],
  en: [/tomorrow/i, /today/i, /tonight/i, /monday|tuesday|wednesday|thursday|friday|saturday|sunday/i],
  tn: [/ghudwa/i, /lyoum/i, /llila/i, /lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche/i],
  ar: [/غداً/i, /اليوم/i, /الليلة/i, /الاثنين|الثلاثاء|الأربعاء|الخميس|الجمعة|السبت|الأحد/i],
  de: [/morgen/i, /heute/i, /heute abend/i, /montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag/i],
  it: [/domani/i, /oggi/i, /stasera/i, /lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica/i],
  es: [/mañana/i, /hoy/i, /esta noche/i, /lunes|martes|miércoles|jueves|viernes|sábado|domingo/i]
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
export const ALL_INTENT_KEYWORDS = {
  fr: INTENT_KEYWORDS_FR,
  en: INTENT_KEYWORDS_EN,
  tn: INTENT_KEYWORDS_TN,
  ar: INTENT_KEYWORDS_AR,
  de: INTENT_KEYWORDS_DE,
  it: INTENT_KEYWORDS_IT,
  es: INTENT_KEYWORDS_ES
};

export const ALL_CATEGORY_KEYWORDS = {
  fr: CATEGORY_KEYWORDS_FR,
  en: CATEGORY_KEYWORDS_EN,
  tn: CATEGORY_KEYWORDS_TN,
  ar: CATEGORY_KEYWORDS_AR
};

// Langues supportées
export const SUPPORTED_LANGUAGES: Language[] = ['fr', 'en', 'tn', 'ar', 'de', 'it', 'es'];
export const DEFAULT_LANGUAGE: Language = 'fr';