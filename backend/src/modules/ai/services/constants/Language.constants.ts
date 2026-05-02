// src/modules/ai/constants/language.constants.ts
// ═══════════════════════════════════════════════════════════════════════════
//  DICTIONNAIRES LINGUISTIQUES — séparés par langue
//  Langues : Français (FR) | English (EN) | Tunisien/Darija (TN) | Arabe (AR)
// ═══════════════════════════════════════════════════════════════════════════

export type Language = 'fr' | 'en' | 'tn' | 'ar';

// ───────────────────────────────────────────────────────────────────────────
// SECTION 1 — INTENT KEYWORDS
// ───────────────────────────────────────────────────────────────────────────

export const INTENT_KEYWORDS_FR: Record<string, string[]> = {
  search: [
    // verbes de recherche
    'cherche', 'recherche', 'rechercher', 'chercher', 'trouver', 'trouve',
    'cherchez', 'recherchez', 'trouvez', 'j cherche', 'je cherche',
    'j recherche', 'je recherche',
    // localisation
    'ou', 'ou est', 'ou se trouve', 'ou puis-je', 'ou peut-on',
    'ou trouver', 'ou est-ce que', 'dans quelle rue', 'dans quel quartier',
    'proche', 'pres', 'alentour', 'autour', 'aux alentours', 'a proximite',
    'dans le quartier', 'dans ma zone', 'dans ma ville', 'dans la region',
    'pas loin', 'pas loin de', 'juste a cote',
    // affichage / listage
    'voir', 'montrer', 'montrez', 'montrez-moi', 'afficher', 'affichez',
    'lister', 'listez', 'liste', 'liste de', 'donne une liste',
    'quels', 'quelles', 'quels sont', 'quelles sont', 'quels types',
    'proposer', 'proposez', 'suggerer', 'suggerez', 'suggere', 'conseiller',
    'conseillez', 'recommandez', 'recommande',
    // disponibilité
    'disponible', 'disponibles', 'ouvert', 'ouverts', 'ouverte', 'ouvertes',
    'libre', 'libres', 'existe', 'existent', 'il y a', 'y a-t-il',
    'est-ce qu il y a', 'est-ce que vous avez', 'avez-vous',
    // exploration
    'explorer', 'decouvrir', 'connaitre', 'savoir s il y a',
    'donne moi', 'donne-moi', 'dis moi', 'dis-moi', 'montrez-moi',
    'je veux savoir', 'je cherche a savoir', 'j aimerais voir',
    'j aimerais connaitre', 'j aimerais savoir',
  ],
  booking: [
    // verbes de réservation
    'reserver', 'reservation', 'reservations', 'reservez', 'je veux reserver',
    'je voudrais reserver', 'j aimerais reserver', 'faire une reservation',
    'planifier', 'planifiez', 'programmer', 'programmez',
    'fixer', 'fixez', 'fixer un rdv', 'prendre rendez-vous',
    'prendre un rdv', 'prendre une table', 'prendre un billet',
    'commander', 'commande', 'passer commande', 'passer une commande',
    // volonté
    'veux', 'voudrais', 'voudrait', 'voudrons', 'aimerais', 'aimerait',
    'je voudrais', 'je veux', 'j aimerais', 'j aimerai',
    'j aurai voulu', 'j aurais aime',
    // besoin
    'besoin', 'besoin de', 'j ai besoin', 'il me faut', 'il nous faut',
    'faut que', 'il faut', 'obligatoire',
    // rendez-vous / slots
    'rendez-vous', 'rdv', 'creneau', 'creneaux', 'horaire', 'horaires',
    'heure', 'heures', 'seance', 'seances',
    // éléments réservables
    'table', 'tables', 'chambre', 'chambres', 'place', 'places',
    'salle', 'salles', 'billet', 'billets', 'ticket', 'tickets',
    'billet d entree', 'entree', 'pass', 'abonnement',
    // confirmations
    'confirmer', 'confirmation', 'valider', 'validation',
    'ok pour', 'd accord pour', 'je confirme', 'c est bon',
  ],
  cancel: [
    // annulation
    'annuler', 'annule', 'annulons', 'j annule', 'annulation', 'annulations',
    'annuler ma reservation', 'annuler mon rdv', 'annuler ma commande',
    'supprimer', 'supprime', 'suppression', 'supprimer ma reservation',
    'effacer', 'enlever', 'retirer', 'desinscrire', 'se desinscrire',
    // impossibilité de venir
    'pas venir', 'ne peux pas venir', 'je ne peux pas venir',
    'ne peux venir', 'je ne viendrai pas', 'ne viendrai pas',
    'ne peut pas venir', 'impossible de venir', 'je ne vais pas venir',
    'je n arrive pas', 'je serai absent', 'absent ce jour',
    'je ne pourrai pas', 'je ne serai pas la',
    // refus / abandon
    'abandonner', 'renoncer', 'me desister', 'desistement',
    'je ne veux plus', 'je ne veux pas', 'changer d avis',
    'finalement non', 'finalement je ne veux plus',
    // remboursement
    'rembourser', 'remboursement', 'recuperer mon argent', 'rembourse',
    // modifier / reporter
    'modifier', 'modifier ma reservation', 'changer', 'changer de date',
    'reprogrammer', 'decaler', 'reporter', 'repousser',
  ],
  help: [
    // aide
    'aide', 'aider', 'aidez', 'aidez-moi', 'au secours',
    'assistance', 'assister', 'support', 'j ai besoin d aide',
    'vous pouvez m aider', 'pouvez-vous m aider',
    // questions de compréhension
    'comment', 'comment ca', 'comment ca marche', 'comment faire',
    'comment utiliser', 'comment fonctionne', 'comment ca fonctionne',
    'comment je peux', 'comment puis-je',
    'quoi', 'que faire', 'que puis-je', 'qu est-ce que', 'qu est-ce que je',
    'expliquer', 'expliquez', 'explique', 'expliquez-moi',
    'comprendre', 'je ne comprends pas', 'je comprends pas', 'j comprends pas',
    // info
    'info', 'information', 'informations', 'renseignement', 'renseignements',
    'instruction', 'instructions', 'guide', 'tutoriel', 'tuto', 'manuel',
    'documentation', 'faq', 'questions frequentes',
    // capacités du bot
    'que peux-tu', 'tu peux faire quoi', 'tes fonctions', 'quelles fonctions',
    'tes capacites', 'que sais-tu', 'quelles commandes',
    'qu est-ce que tu fais', 'qu est-ce que tu peux faire',
    'quelles sont tes fonctionnalites',
  ],
  greeting: [
    // salutations classiques
    'bonjour', 'bonsoir', 'bonne nuit', 'bonne matinee', 'bonne apres-midi',
    'salut', 'salut a toi', 'salut tout le monde', 'coucou', 'allo',
    'hello', 'hey', 'yo', 'wesh', 'wesh gros',
    'bonjour a tous', 'bonsoir a tous', 'bonsoir tout le monde',
    // formules d'ouverture
    'bonne journee', 'bonne soiree', 'bonne semaine',
    'ravi de te parler', 'ravi de vous parler', 'content de vous voir',
    'ca va', 'comment ca va', 'ca va bien', 'comment allez-vous',
    'comment vas-tu', 'comment vous allez', 'tu vas bien', 'vous allez bien',
  ],
  feedback: [
    // évaluation
    'avis', 'mon avis', 'donner mon avis', 'laisser mon avis',
    'note', 'noter', 'notez', 'donner une note', 'laisser une note',
    'evaluer', 'evaluez', 'evaluation', 'mettre une note',
    'etoile', 'etoiles', 'score', 'point', 'points', 'mettre des etoiles',
    // commentaires
    'commentaire', 'commenter', 'commentez', 'laisser un avis',
    'laisser un commentaire', 'partager mon avis', 'partager mon experience',
    'donner un retour', 'faire un retour',
    // recommandation
    'recommande', 'recommander', 'je recommande', 'je ne recommande pas',
    'je conseille', 'je deconseille',
    // satisfaction
    'satisfaction', 'satisfait', 'insatisfait', 'content', 'mecontent',
    'opinion', 'critique', 'retour', 'retour d experience',
    'experience', 'mon experience', 'c etait comment', 'comment c etait',
    // qualité
    'qualite', 'qualite du service', 'qualite des produits',
    'superbe', 'decevant', 'decu', 'pas terrible',
  ],
  goodbye: [
    // au revoir
    'au revoir', 'aurevoir', 'a bientot', 'a tout a l heure',
    'a plus', 'a plus tard', 'a tres bientot', 'a la prochaine',
    'adieu', 'salut', 'bye', 'bye bye', 'ciao', 'tchao',
    // formules de fin
    'bonne journee', 'bonne continuation', 'passe une bonne journee',
    'bonne soiree', 'passe une bonne soiree',
    'merci et au revoir', 'merci bonne journee', 'merci bonsoir',
    // satisfaction en fin
    'c est tout', 'j ai tout', 'j ai tout ce qu il me faut',
    'c est bon merci', 'c est parfait merci', 'ca marche merci',
    'ok merci', 'tres bien merci', 'super merci', 'parfait merci',
    'c est tout pour moi', 'j ai plus de questions',
  ],
};

export const INTENT_KEYWORDS_EN: Record<string, string[]> = {
  search: [
    // direct search
    'find', 'search', 'look', 'look for', 'look up', 'seek', 'seeking',
    'hunt', 'scout', 'explore', 'browse', 'discover', 'locate', 'get',
    'i need to find', 'i want to find', 'i am looking for',
    'can you find', 'can you show', 'could you find',
    // location
    'near', 'nearby', 'near me', 'close to', 'close by', 'around me',
    'around here', 'in the area', 'in my area', 'in my city',
    'in my neighborhood', 'in my street', 'around the corner',
    'local', 'closest', 'nearest', 'around', 'surrounding',
    'walking distance', 'not far', 'just around',
    // display
    'show', 'show me', 'display', 'list', 'give me', 'give me a list',
    'tell me about', 'what are the', 'which', 'which are', 'which ones',
    // availability
    'available', 'open', 'is there', 'are there', 'do you have',
    'any', 'any available', 'still open', 'currently open',
    // suggestions
    'suggest', 'recommend', 'advise', 'propose', 'any suggestions',
    'what do you recommend', 'what would you suggest',
    'i want to know', 'i d like to know', 'i would like to know',
  ],
  booking: [
    // book
    'book', 'booking', 'reserve', 'reservation', 'reservations',
    'schedule', 'schedule a', 'set up', 'arrange', 'organize',
    'make a booking', 'make a reservation', 'i want to book',
    'i d like to book', 'i would like to book', 'can i book',
    'can i reserve', 'could i book',
    // appointment
    'appointment', 'appointments', 'slot', 'slots', 'time slot', 'session',
    // order
    'order', 'place an order', 'place order', 'i want to order',
    // desire
    'want', 'i want', 'i d like', 'i would like', 'i need', 'i require',
    'looking to', 'plan to', 'planning to', 'hoping to', 'wish to',
    // confirm
    'confirm', 'confirmation', 'finalize', 'lock in', 'secure', 'i confirm',
    // elements
    'table', 'room', 'seat', 'spot', 'ticket', 'pass', 'entry',
    'check in', 'checkin', 'check-in', 'check out',
  ],
  cancel: [
    // cancel
    'cancel', 'cancellation', 'cancelation', 'cancel my', 'cancel the',
    'call off', 'call it off', 'scrap', 'scratch', 'i want to cancel',
    'i d like to cancel', 'how do i cancel', 'can i cancel',
    // delete
    'delete', 'remove', 'delete my', 'remove my', 'drop', 'erase',
    // unable
    "can't come", 'cannot come', "won't come", 'will not come',
    'unable to come', 'unable to make it', "can't make it",
    'wont be able', 'will not be able', "i'm not coming",
    'not going to make it', 'something came up',
    // abort
    'abort', 'stop', 'end', 'terminate', 'undo', 'back out',
    // change
    'reschedule', 'postpone', 'change my booking', 'move my reservation',
    'change date', 'change time', 'move to another date',
    // refund
    'refund', 'get my money back', 'money back', 'reimbursement',
  ],
  help: [
    // help
    'help', 'assist', 'assistance', 'support', 'guide', 'guidance',
    'help me', 'i need help', 'can you help', 'could you help',
    'please help', 'i need assistance', 'need support',
    // questions
    'how', 'how do i', 'how can i', 'how to', 'how does',
    'how do you', 'how would i', 'what', 'what is', 'what are',
    'what can you', 'what do you', 'what should i',
    // explain
    'explain', 'tell me', 'show me how', 'walk me through',
    'describe', 'clarify', 'elaborate', 'can you explain',
    // info
    'info', 'information', 'details', 'more info', 'find out',
    'tutorial', 'instructions', 'manual', 'faq',
    // bot capabilities
    'what can you do', 'what are your features', 'what commands',
    'capabilities', 'functions', 'features', 'options',
    'what do you offer', 'what services do you provide',
  ],
  greeting: [
    'hello', 'hi', 'hey', 'howdy', 'greetings', 'sup', 'yo',
    'good morning', 'good afternoon', 'good evening', 'good night',
    'how are you', 'how do you do', 'how s it going', 'what s up',
    'nice to meet you', 'pleased to meet you',
    "how's everything", "how's life", "how ya doing", "how r u",
    'hiya', 'heya', 'wassup', 'whats good',
  ],
  feedback: [
    'feedback', 'review', 'rate', 'rating', 'ratings',
    'stars', 'star rating', 'give a rating', 'leave a review',
    'leave feedback', 'write a review', 'write a comment',
    'comment', 'opinion', 'thoughts', 'impression',
    'recommend', 'not recommend', 'would recommend', 'would not recommend',
    'satisfied', 'unsatisfied', 'happy with', 'unhappy with',
    'experience', 'my experience', 'how was', 'how is',
    'quality', 'service quality', 'what do you think', 'i think',
    'in my opinion', 'i liked', 'i didn t like', 'i loved', 'i hated',
  ],
  goodbye: [
    'bye', 'goodbye', 'see you', 'see ya', 'later', 'cya',
    'take care', 'have a good one', 'have a nice day', 'have a great day',
    'talk later', 'talk soon', 'catch you later', 'until next time',
    'farewell', 'so long', "that's all", "that's it", "i'm done",
    "all good thanks", 'thanks bye', 'ok thanks bye',
    'cheers', 'peace', 'peace out', 'gotta go', 'i gotta go',
    'im leaving', 'signing off', 'ttyl', 'ttys',
  ],
};

export const INTENT_KEYWORDS_TN: Record<string, string[]> = {
  // Dialecte tunisien (Darija / Tounsi) — translittéré
  search: [
    // localisation / où
    'fama', 'fayn', 'win', 'wini', 'wen', 'wena', 'feyn', 'fein', 'wiin',
    'fayna', 'wein', 'weina', 'fiha', 'fih', 'finh',
    'win najjem', 'win nlaqqa', 'win nchouf',
    // voir / chercher
    'nchof', 'nchouf', 'nchuf', 'chof', 'chouf', 'chuf',
    'yechof', 'yechouf', 'nchofhom', 'nchoufhom',
    'nlaqqa', 'nlaqa', 'nlaqah', 'nlaquiha', 'laqqa', 'laqa',
    'n7ott', 'n7et', 'nekhdem',
    // pouvoir / chercher
    'najjem', 'najem', 'njjem', 'njem', 'najma', 'najjam', 'ynajem',
    'nqader', 'nqadar', 'nkhodem',
    // proximité
    'qrib', 'grib', 'qriib', 'griib', 'qriba', 'griba',
    'qribna', 'gribna', 'qrib meni', 'grib meni',
    'hawali', 'howali', 'haweli', 'hawaliha', 'fi hwali',
    // existence
    'ena', 'fi', 'fih', 'fiha', 'mawjoud', 'mawjouda', 'kayen', 'kayena',
    'wesh kayen', 'wesh fih', 'wesh fih chi',
    // montrer / afficher
    'warrini', 'warini', 'warrni', 'warrihom', 'wariihom',
    'bech', 'besh', 'beche', 'bch', 'bahh',
    'a3tini', 'a3tili', 'a3ti', 'attini', 'attili',
    // lister
    'ktibli', '7ottli', 'hab', 'habb', 'hatli', 'hebbili',
    'aawedhli', 'wriha', 'wurini',
  ],
  booking: [
    // réserver — toutes variations phonétiques
    'hejez', 'hejiz', 'hajez', 'hjez', 'hjiz', 'heji', 'haji', 'hji',
    'nheji', 'nhaji', 'nhejiz', 'nhejez', 'yheji', 'yhaji',
    'ihejez', 'ihajez', 'nehji', 'nehaji',
    'hejez li', 'hejezli', 'hajezli',
    // vouloir / besoin
    'nheb', 'nhebb', 'nhab', 'nhabb', 'nhebbek', 'habba', 'hubb',
    'nheb nhejez', 'nheb njiw', 'nheb nrawah',
    '3andi', 'andi', 'a3ndi', '3ndi', '3andna',
    'lazem', 'laazem', 'lazim', 'laazim', 'ylzem',
    'khassni', 'khasna',
    // rendez-vous
    'mawid', 'mawad', 'maw3id', 'maw3ad', 'mwaid', 'mwad',
    'mawid mta3i', 'mawid fi',
    // table / place
    'tabla', 'tebla', 'tabela', 'tebli', 'tableti',
    'mekda', 'meqd', 'mqa3da', 'mqa3d', 'kursi', 'blas',
    // chambre
    'bit', 'bett', 'bit noumy', 'ghorfa', 'ghorfti',
    // commander / demander
    'tlab', 'etlab', 'tlebli', 'commanda', 'commandili',
    'tleblou', 'yettlab',
    // confirmer
    'akkad', 'akkad li', 'confirm', 'takkad', 'nakkad',
  ],
  cancel: [
    // annuler
    'lheg', 'alheg', 'elheg', 'nheg', 'lheg el', 'elheg el',
    'batel', 'btal', 'btil', 'batil', 'battal', 'battil',
    'nbatel', 'nbattel', 'tbattel', 'abatel',
    // ne pas venir
    'ma njiich', 'manjiich', 'ma najich', 'manajich',
    'ma jich', 'majich', 'mish ji', 'mishji',
    'ma yejich', 'mayejich', 'ma tejich',
    'ma nqaderch', 'manqaderch', 'ma nqadarche', 'ma nqader niji',
    'majech', 'mich ji', 'ma tawa jiich', 'ma3adesh niji',
    'ma bqetsh', 'ma3adesh nheb',
    // arrêter
    'waqef', 'waqaf', 'wekf', 'ewqef', 'ewqaf', 'wqef',
    // effacer
    'emseh', 'mseh', 'emsah', 'msah', 'masha', 'amsah',
    'enhiha', 'nhiha', 'shilha', 'chilha',
    // reporter
    'baadel', 'badel', 'baddalou', 'baddel', 'badellou',
    'baadlou', 'baddilha',
    // rembourser
    'rab7i', 'flousy', 'rdouly flousy', 'aredli flousy',
    'roddha', 'redo flousy',
  ],
  help: [
    // aide
    '3aweni', '3awneni', 'aweni', 'awneni', 'a3weni', 'sa3edni',
    'i3aweni', 'i3awneni', 'yeawini', 'a3wni', 'a3wanni',
    'sar3edni', 'ta3aweni', '3awnini',
    // comprendre
    'fehem', 'fehim', 'nfehim', 'nfehem', 'fahim', 'nfhem',
    'ma fehimtch', 'ma fehimtsh', 'ma fhemtch', 'mich fahim',
    'mich fehim', 'ma3rafch', 'ma3raftch',
    // quoi / comment
    'chno', 'chnowa', 'shnoa', 'shnowa', 'chneya', 'chnahi', 'chnahy',
    'kifech', 'kifash', 'kifesh', 'kefash', 'kefesh', 'kifah', 'kifeh',
    'kifhe', 'kif', 'kif taw', 'kif bech', 'kif yemchi',
    'wesh', 'wech', 'wach', 'wechbi', 'weshbek',
    // info
    '3arrefni', '3arrifni', 'khabberni', 'khebberni',
    'qulha', 'qolha', 'qullha', 'qelli', 'gelli',
    // guide
    'dellni', 'dalni', 'delni', 'weddini', 'waddini',
    'wjehni', 'ershidni', 'dellini',
  ],
  greeting: [
    // salutations
    'ahla', 'ahlen', 'ahlen bik', 'ahlen biha',
    'salam', 'slam', 'slema', 'salamou', 'slaaamou',
    'marhba', 'marhaba', 'marhbik', 'marhbek', 'marhbin', 'marhbeni',
    // comment ça va
    'labas', 'labes', 'lbes', 'lbes 3lik', 'labes 3lik', 'labas 3lik',
    'keefak', 'kifak', 'kifek', 'keefek', 'kif 7alek', 'kif 7alik',
    'kif nhar', 'kif el7el', 'kif sa7bek', 'kif 7alik',
    'ech 7wejek', 'ech 7woujek', 'labes lik',
    // salutations du jour
    'sba7 elkhir', 'sbah khir', 'sba7khir', 'sba7 el kher', 'sbah el kher',
    'sba7 elkhir 3lik', 'ysba7 3lik bel kher',
    'msa elkhir', 'mesa khir', 'masa elkhir', 'masa kher',
    'msa el kher 3lik',
    // expressions d'ouverture
    'ychou', 'yechou', 'yechaw', 'chelya', 'chella',
    'halloum', 'hallouma', 'hala', 'halabikoum',
  ],
  feedback: [
    // avis
    'ra2yi', 'ra2y', 'rayo', 'ra3y', 'rai', 'ra2i', 'ra2yu', 'errai',
    'ra2yi fi', 'ra2yi 3al',
    // plaire / aimer
    '3ajbek', '3ajbak', 'a3jebek', 'a3jebak', 'y3ajeb', 'a3jebni',
    'ma3ajbich', 'ma a3jebni', 'ma 3ajbatch', 'ma3ajbiniich',
    'a7bebtou', 'a7babtu', 'krahtu', 'ma3jabniich',
    // service
    'kif lkhidma', 'kifeh lkhidma', 'kif el khidma', 'kif elkhidma',
    'kif el service', 'kif el khidma mta3kom',
    // noter
    'note', 'nnoti', 'notili', 'notilhom', 'nota',
    'nta3ti', 'e3ta', 'aw3a', 'n3eti', 'na3ti nota',
    // étoiles
    'njma', 'njom', 'njoum', 'njem', 'tejma', 'ntajom',
    // qualité
    'mezyan', 'mezyana', 'mzian', 'bahi', 'bahia', 'bhayen',
    'khayeb', 'khayba', 'khaybeen', 'khyeb',
    'normal', 'wech bahi', 'wech mezyan', 'wech a7la',
    'zorba', 'ta7i', 'ta7ia', 'maalich', 'mziyenach',
  ],
  goodbye: [
    'beslema', 'bislama', 'bisslema', 'b slema', 'bslema', 'bsslema',
    'beslema bik', 'yalla beslema',
    'baraka', 'braka', 'bareka', 'barekallah',
    'yalla', 'yalllah', 'yela', 'alla', 'yala', 'yala bik',
    'msek bkhir', 'msek bel kher', 'tmessha bkhir',
    'tsbah bel kher', 'tsbah 3la kher',
    'sla3lik', 'sel3lik', 'sla 3lik', 'slemtek',
    'n9aw lahna', 'n9aw lah', 'njaw lahna',
    'tawa nrawah', 'nrawah', 'shuya nrawah', 'yalla nrawah',
    'w3lik salam', 'wa3lik salam',
    'shokran bzzaf', 'bzzaf shokran', 'merci bzzaf',
  ],
};

export const INTENT_KEYWORDS_AR: Record<string, string[]> = {
  // Arabe standard + formes maghrébines / égyptiennes écrites
  search: [
    // بحث
    'ابحث', 'ابحث عن', 'بحث', 'اجد', 'اجد لي', 'ايجاد',
    'اريد ان اجد', 'اريد ان ابحث', 'هل يوجد', 'هل توجد', 'هل عندكم',
    'هل لديكم', 'هل يمكنني ان اجد',
    // أين
    'فين', 'وين', 'اين', 'اين يوجد', 'اين يمكن', 'اين اجد',
    'في اي مكان', 'اي مكان', 'ما مكان',
    // عرض
    'اعرض', 'اظهر', 'اظهر لي', 'ارني', 'اريني', 'اعطني قائمة',
    'قائمة', 'اريد قائمة', 'اريد ان ارى', 'ارى', 'اشوف',
    // قرب
    'قريب', 'قريب مني', 'بالقرب', 'بالقرب مني', 'قرب منى',
    'حولي', 'حوالي', 'في محيطي', 'في منطقتي', 'بجواري',
    // توافر
    'متاح', 'متاحة', 'موجود', 'موجودة', 'مفتوح', 'مفتوحة',
    'هل متاح', 'هل موجود',
    // اقتراح
    'اقترح', 'اقترح لي', 'انصحني', 'انصح لي',
    'ماذا تنصح', 'ماذا تقترح', 'ماذا توصي',
  ],
  booking: [
    // حجز
    'احجز', 'احجز لي', 'حجز', 'حجوزة', 'الحجز', 'اريد حجز',
    'اريد ان احجز', 'هل يمكن الحجز', 'هل يمكنني الحجز',
    'كيف احجز', 'اريد حجز مكان', 'احجز مكان',
    // موعد
    'موعد', 'مواعيد', 'حدد موعد', 'اريد موعد', 'اريد مواعيد',
    'اريد تحديد موعد', 'حجز موعد',
    // طلب
    'اطلب', 'اطلب لي', 'طلب', 'اريد ان اطلب', 'طلب حجز', 'اطلب مكان',
    // طاولة / غرفة
    'طاولة', 'طاولة لـ', 'طاولة ل', 'غرفة', 'غرفة لـ',
    'مقعد', 'مقاعد', 'كرسي', 'مكان',
    // رغبة
    'اريد', 'اريد ان', 'ارغب في', 'ارغب ب', 'احتاج', 'احتاج الى',
    'ابي', 'ابغى', 'نفسي في', 'نفسي اروح',
    // تأكيد
    'اكد', 'تأكيد', 'تأكيد الحجز', 'اريد تأكيد',
  ],
  cancel: [
    // الغاء
    'الغ', 'الغ حجزي', 'الغاء', 'الغاء الحجز', 'اريد الالغاء',
    'اريد ان الغي', 'كيف الغي', 'كيف الغ',
    // حذف
    'احذف', 'حذف', 'احذف حجزي', 'حذف الحجز',
    // عدم المجيء
    'لن اتمكن', 'لن اتمكن من الحضور', 'لن احضر', 'لن اجي',
    'لا استطيع الحضور', 'لا يمكنني الحضور', 'ما راح اجي',
    'ما راح اقدر', 'مش قادر اجي', 'مش قادر احضر',
    'ظرف طرأ', 'طرأت ظروف', 'ما قدرتش', 'ما نقدرش',
    // وقف
    'اوقف', 'وقف', 'اوقف الحجز', 'الغي',
    // تعديل
    'عدل', 'غير', 'غير موعدي', 'اجل', 'اجل موعدي',
    'غير الموعد', 'بدل الموعد',
    // استرداد
    'استرداد', 'استرداد المبلغ', 'ارجاع المال', 'ارجاع الفلوس',
    'استرجاع المبلغ', 'رجعلي فلوسي',
  ],
  help: [
    // مساعدة
    'ساعدني', 'ساعد', 'مساعدة', 'اريد مساعدة', 'احتاج مساعدة',
    'عاوني', 'عاون', 'عاونني', 'ساعدني من فضلك',
    'ممكن تساعدني', 'محتاج مساعدة',
    // كيف
    'كيف', 'كيفاش', 'كيفه', 'كيف يمكن', 'كيف اقدر',
    'كيف استخدم', 'كيف اعمل', 'كيف اطلب', 'كيف احجز',
    // ماذا / شنوا
    'ماذا', 'ماذا يمكنك', 'ماذا تستطيع', 'شنوا', 'شنوه',
    'ما هو', 'ما هي', 'ما هذا', 'ما هذه',
    // شرح
    'اشرح', 'اشرح لي', 'شرح', 'وضح', 'وضح لي',
    'فهمني', 'افهمني', 'وضح لي', 'اعطني تفاصيل',
    // معلومات
    'معلومات', 'تفاصيل', 'اعطني معلومات', 'اخبرني',
    'ما هي الخيارات', 'ما هي الامكانيات', 'ما هي الخدمات',
    // فهم
    'لم افهم', 'ما فهمتش', 'مش فاهم', 'لا افهم', 'مفهمتش',
  ],
  greeting: [
    'السلام عليكم', 'سلام', 'السلام', 'وعليكم السلام', 'عليكم السلام',
    'مرحبا', 'اهلا', 'اهلا وسهلا', 'حياك', 'حياكم', 'اهلا بيك',
    'صباح الخير', 'صباح النور', 'مساء الخير', 'مساء النور',
    'كيف الحال', 'كيف حالك', 'كيفك', 'كيف صحتك', 'كيف الاحوال',
    'ازيك', 'ازيكم', 'عامل ايه', 'كيف حالكم', 'تمام',
    'لاباس', 'لاباس عليك', 'شلونك', 'شلونكم', 'هلا',
  ],
  feedback: [
    'تقييم', 'تقييمي', 'اريد تقييم', 'اقيم', 'تقيم', 'اريد ان اقيم',
    'رأيي', 'رايي', 'راي', 'اعطيك رايي', 'رأي', 'ما رأيك',
    'تعليق', 'اترك تعليق', 'اريد ان اعلق', 'اضيف تعليق',
    'نجوم', 'نجمات', 'تقييم نجوم', 'اعطي نجوم',
    'كيف الخدمة', 'كيف كانت الخدمة', 'هل الخدمة جيدة',
    'ممتاز', 'جيد', 'سيء', 'ردئ', 'ليس جيد',
    'انصح', 'لا انصح', 'انصح به', 'لا انصح به', 'ينصح',
    'راضي', 'غير راضي', 'راضية', 'غير راضية', 'مبسوط', 'مش مبسوط',
  ],
  goodbye: [
    'مع السلامة', 'في امان الله', 'باي', 'باي باي',
    'بسلامة', 'بالسلامة', 'الله يسلمك', 'الله يسلمكم',
    'وداعا', 'الى اللقاء', 'نلتقي لاحقا', 'الى المرة القادمة',
    'تصبح على خير', 'تمسي على خير', 'شكرا مع السلامة',
    'انتهيت', 'كل شيء تمام شكرا', 'شكرا وداعا',
    'خلاص', 'خلاص شكرا', 'بس هذا', 'هذا كل شيء',
    'يسلمو', 'يعطيك الصحة', 'ربي يحفظك',
  ],
};

// ───────────────────────────────────────────────────────────────────────────
// SECTION 2 — CATEGORY KEYWORDS
// ───────────────────────────────────────────────────────────────────────────

export const CATEGORY_KEYWORDS_FR: Record<string, string[]> = {
  restaurant: [
    'restaurant', 'resturant', 'restorant', 'restoran',
    'resto', 'restau', 'brasserie', 'bistro', 'bistrot', 'taverne',
    'pizzeria', 'trattoria', 'rotisserie', 'grill', 'cantine',
    'manger', 'repas', 'dejeuner', 'diner', 'petit-dejeuner', 'brunch',
    'nourriture', 'cuisine', 'plat', 'menu', 'carte', 'gastronomie',
    'gastronomique', 'fast-food', 'fastfood', 'restauration rapide',
    'kebab', 'sandwicherie', 'boulangerie', 'patisserie', 'creperie', 'snack',
    'table', 'reservez une table', 'diner dehors', 'manger dehors',
    'cafe', 'cafeteria', 'salon de the', 'coffee shop',
    'livraison', 'livraison repas', 'a emporter', 'take-away',
    'sushi', 'pizza', 'burger', 'seafood', 'fruit de mer',
    'halal', 'vegetarien', 'vegan',
  ],
  hotel: [
    'hotel', 'hotele', 'hotle', 'hostel', 'auberge', 'auberge de jeunesse',
    'residence', 'apparthotel', 'gite', 'gite rural', 'maison d hotes',
    'logement', 'hebergement', 'nuitee', 'nuit', 'dormir',
    'chambre', 'chambre double', 'chambre simple', 'suite', 'deluxe',
    'pension', 'pension complete', 'demi-pension', 'petit-dejeuner inclus',
    'check-in', 'checkout', 'reception', 'riad', 'villa', 'resort',
    'sejour', 'vacances', 'voyage', 'trip',
  ],
  spa: [
    'spa', 'hammam', 'bain turc', 'bain maure', 'sauna', 'jacuzzi',
    'massage', 'massage relaxant', 'massage sportif', 'massage oriental',
    'bien-etre', 'bienetre', 'relaxation', 'detente', 'zen',
    'soin', 'soins', 'soin du visage', 'soin de la peau', 'soin du corps',
    'beauty', 'beaute', 'esthetique', 'estheticienne', 'cosmetique',
    'aromatherapie', 'reflexologie', 'gommage', 'enveloppement', 'peeling',
    'centre de bien-etre', 'centre spa', 'spa hotel', 'day spa',
    'meditation', 'yoga', 'thalasso', 'thalassotherapie',
  ],
  gym: [
    'gym', 'salle de sport', 'salle de fitness', 'fitness', 'musculation',
    'powerlifting', 'crossfit', 'hiit', 'circuit training',
    'sport', 'entrainement', 'seance', 'seance de sport',
    'yoga', 'pilates', 'zumba', 'aerobic', 'cardio', 'stretching',
    'coach sportif', 'coach personnel', 'personal trainer',
    'natation', 'piscine', 'aquagym', 'aquafit',
    'arts martiaux', 'boxe', 'karate', 'judo', 'mma', 'taekwondo',
    'spinning', 'cycling', 'course a pied', 'running',
  ],
  salon: [
    'coiffeur', 'coiffeuse', 'salon de coiffure', 'barbier', 'barber',
    'salon', 'salon beaute', 'salon de beaute',
    'coupe', 'coupe de cheveux', 'coiffure', 'brushing', 'lissage',
    'ongles', 'manucure', 'pedicure', 'gel ongles', 'nail art',
    'maquillage', 'maquillage professionnel', 'epilation', 'cire',
    'coloration', 'meches', 'extension', 'balayage', 'tie-dye',
    'barbe', 'rasage', 'contour de barbe', 'taille de barbe',
    'cils', 'extension de cils', 'sourcils', 'microblading',
    'permanente', 'defrisage', 'keratine',
  ],
  clinic: [
    'clinique', 'cabinet medical', 'medecin', 'docteur', 'dr', 'centre medical',
    'dentiste', 'orthodontiste', 'ophtalmologue', 'dermatologue',
    'gynecologue', 'cardiologue', 'neurologue', 'pediatre', 'generaliste',
    'pharmacie', 'parapharmacie', 'laboratoire', 'analyse', 'prise de sang',
    'kinesitherapie', 'kine', 'osteopathie', 'osteopathe', 'chiropracteur',
    'psychologue', 'psychiatre', 'nutritionniste', 'dieticien',
    'consultation', 'rendez-vous medical', 'bilan', 'examen', 'radio',
    'echographie', 'scanner', 'irm', 'urgences',
  ],
  event: [
    'evenement', 'event', 'soiree', 'soiree privee', 'salle des fetes',
    'mariage', 'fiancailles', 'anniversaire', 'bapteme', 'fete',
    'conference', 'seminaire', 'reunion', 'reunion d affaires',
    'spectacle', 'concert', 'theatre', 'exposition', 'galerie',
    'location de salle', 'salle de reception', 'salle de banquet',
    'ceremonie', 'banquet', 'gala', 'reception', 'cocktail',
    'team building', 'atelier', 'workshop',
  ],
};

export const CATEGORY_KEYWORDS_EN: Record<string, string[]> = {
  restaurant: [
    'restaurant', 'eatery', 'diner', 'bistro', 'brasserie', 'tavern',
    'pizzeria', 'steakhouse', 'seafood', 'sushi', 'thai', 'italian',
    'french', 'chinese', 'indian', 'mexican', 'lebanese', 'mediterranean',
    'eat', 'food', 'meal', 'lunch', 'dinner', 'breakfast', 'brunch',
    'cuisine', 'dish', 'menu', 'takeout', 'takeaway', 'delivery',
    'fast food', 'burger', 'sandwich', 'pizza', 'kebab', 'wings',
    'cafe', 'coffee shop', 'bakery', 'pastry', 'snack bar', 'grill',
    'halal', 'vegetarian', 'vegan', 'organic', 'fine dining',
  ],
  hotel: [
    'hotel', 'hostel', 'motel', 'inn', 'lodge', 'resort',
    'bed and breakfast', 'b&b', 'guesthouse', 'guest house',
    'villa', 'apartment hotel', 'serviced apartment', 'airbnb',
    'room', 'double room', 'single room', 'suite', 'deluxe', 'suite',
    'stay', 'accommodation', 'lodging', 'overnight', 'sleep',
    'check-in', 'checkout', 'reception', 'concierge',
  ],
  spa: [
    'spa', 'hammam', 'turkish bath', 'sauna', 'jacuzzi', 'hot tub',
    'massage', 'relaxing massage', 'sports massage', 'hot stone massage',
    'wellness', 'well-being', 'relaxation', 'relax',
    'facial', 'body treatment', 'scrub', 'wrap', 'peel',
    'beauty', 'beauty treatment', 'esthetic', 'aesthetics',
    'aromatherapy', 'reflexology', 'meditation', 'detox',
  ],
  gym: [
    'gym', 'fitness', 'fitness center', 'sports center', 'sports hall',
    'workout', 'training', 'exercise', 'session', 'class',
    'weightlifting', 'bodybuilding', 'crossfit', 'hiit', 'cardio',
    'yoga', 'pilates', 'zumba', 'aerobics', 'spinning',
    'personal trainer', 'coach', 'sports coach', 'pt',
    'swimming', 'pool', 'aqua gym', 'aquafit',
    'martial arts', 'boxing', 'karate', 'judo', 'mma', 'bjj',
  ],
  salon: [
    'salon', 'hair salon', 'barber', 'barbershop', 'hairdresser',
    'haircut', 'hairstyle', 'blowout', 'straightening', 'coloring',
    'nails', 'manicure', 'pedicure', 'gel nails', 'nail art', 'acrylics',
    'makeup', 'waxing', 'threading', 'eyebrows', 'lashes',
    'beard', 'shave', 'trim', 'fade', 'skin fade',
    'eyelashes', 'lash extensions', 'microblading',
    'beauty salon', 'nail salon', 'day spa',
  ],
  clinic: [
    'clinic', 'medical center', 'doctor', 'physician', 'dr',
    'dentist', 'orthodontist', 'optometrist', 'dermatologist',
    'gynecologist', 'cardiologist', 'neurologist', 'pediatrician',
    'pharmacy', 'lab', 'laboratory', 'blood test',
    'physiotherapy', 'physiotherapist', 'osteopath', 'chiropractor',
    'psychologist', 'psychiatrist', 'nutritionist', 'dietitian',
    'consultation', 'appointment', 'checkup', 'exam', 'scan', 'xray',
  ],
  event: [
    'event', 'venue', 'party', 'wedding', 'engagement', 'birthday',
    'conference', 'seminar', 'meeting', 'corporate event',
    'concert', 'show', 'theater', 'exhibition', 'gallery',
    'reception', 'banquet', 'gala', 'ceremony',
    'event hall', 'function room', 'ballroom', 'private room',
    'team building', 'workshop', 'retreat',
  ],
};

export const CATEGORY_KEYWORDS_TN: Record<string, string[]> = {
  restaurant: [
    'makla', 'mekla', 'nakol', 'mazel', 'makal', 'tajin', 'tajine',
    'restaurant', 'resto', 'mta3 makla', 'win nakol',
    'couscous', 'koucha', 'brik', 'fricasse', 'ojja', 'chakchouka',
    'merguez', 'kafteji', 'bambalouni', 'harissa',
    'snack', 'sandwitch', 'sandouich', 'kaskrout',
    'kahwa', 'qahwa', 'cafe', 'qahwet',
    'ghda', 'ghada', 'a3cha', 'a3sha', 'ftour', 'bkhor',
    'pizza', 'burger', 'tacos', 'chawarma', 'kebab',
    'halal', 'samak', 'fruits de mer',
  ],
  hotel: [
    'otil', 'outil', 'hotel', 'utel',
    'bit', 'bett', 'ghorfa', 'ghorfet',
    'mahal', 'manzal', 'dar',
    'nyem', 'nayem', 'byet', 'byet noma', 'bet el noma',
    'libas', 'iqama', 'mbi9',
    'villa', 'manzal', 'chalets', 'chalet',
  ],
  spa: [
    'hmmam', 'hammam', 'spa', 'hamamm',
    'massage', 'massaj', 'massaje',
    'rlaksation', 'ralaksation', 'relaks', 'rla9sa',
    'soin', 'msayes', 'hsina', 'ta3lab',
    'detant', 'raha', 'tarwi7a',
    'zen', 'bel kher',
  ],
  gym: [
    'sala sport', 'sportsala', 'sala riyadha', 'sala sport mta3',
    'tmarran', 'tmaren', 'exercice', 'sport', 'riyadha',
    'musculasyon', 'musculasion', 'body building',
    'yoga', 'zumba', 'fitness',
    'el gym', 'gym', 'sala', 'braya',
    'boxing', 'karate', 'judo', 'arts martiaux',
  ],
  salon: [
    'hajjem', 'hejjem', 'hajjam', 'hajjem',
    'salle beaute', 'salon beaute', 'salon el beaute',
    'coupe', 'qass', 'qas', 'qasa', 'taqsira',
    '7ela9a', 'hela9a', 'helaka', 'helq',
    'manycur', 'pedicur', 'nails',
    'maquiyaj', 'makiyaj', 'maquillage',
    'barbe', 'tresser', 'lissage', 'couleur',
    'sourcils', 'cils', 'epilation',
  ],
  clinic: [
    'twabib', 'tbib', 'doctor', 'docteur', 'dokteur',
    'clinica', 'clinique', 'moustachfa', 'spitar', 'mostapha',
    'sanner', 'analyse', 'taya7', 'tayah', 'ta7lil',
    'pharmacie', 'farmasyen', 'saidliya',
    'dantist', 'dentiste', 'snan', 'derdo',
    'kine', 'osteo', 'psy',
    'radio', 'scanner', 'echo',
  ],
  event: [
    '3ars', 'ars', '3arsa', 'freh', 'frh', 'far7a',
    'khotba', 'khitba', 'milad',
    'festa', 'partie', 'soiree', 'lila',
    '3id milad', 'eid milad', '3id',
    'sala', 'qa3a', 'salle', 'qa3at afra7',
    'concert', 'hafla', 'hfla', 'musique', 'ghna',
    'mahrajan', 'festival',
  ],
};

export const CATEGORY_KEYWORDS_AR: Record<string, string[]> = {
  restaurant: [
    'مطعم', 'مطاعم', 'اكل', 'طعام', 'ماكل', 'ناكل', 'اكلة',
    'غداء', 'عشاء', 'فطور', 'فطار', 'افطار',
    'كافيه', 'مقهى', 'كافيتريا', 'قهوة',
    'وجبة', 'وجبات', 'منيو', 'قائمة طعام',
    'توصيل', 'توصيل اكل', 'طلب اكل', 'اطلب اكل',
    'برجر', 'بيتزا', 'كباب', 'شاورما', 'فلافل', 'شيش طاووق',
    'مشويات', 'بحريات', 'سمك', 'حلال', 'نباتي',
    'كسكسي', 'طاجين', 'حريسة', 'برك',
  ],
  hotel: [
    'فندق', 'فنادق', 'نزل', 'شقة فندقية', 'ريزيدانس',
    'غرفة', 'غرف', 'جناح', 'اقامة', 'اقامة ليلية',
    'حجز فندق', 'ليلة', 'نوم', 'مبيت',
    'استقبال', 'شيك ان', 'شيك اوت',
    'ريزورت', 'منتجع', 'فيلا', 'شاليه',
    'رياض', 'دار', 'بيت الضيافة',
  ],
  spa: [
    'حمام', 'حمام مغربي', 'حمام تركي', 'سبا', 'ساونا', 'جاكوزي',
    'مساج', 'تدليك', 'استرخاء', 'راحة', 'هدوء',
    'علاج جسدي', 'علاج بالاعشاب', 'علاج بالزيوت',
    'تجميل', 'عناية بالبشرة', 'قشرة', 'جلسة تجميل',
    'ارومثيرابي', 'ريفلكسولوجي', 'تأمل', 'ديتوكس',
  ],
  gym: [
    'صالة رياضية', 'صالة', 'صالة جيم', 'جيم', 'نادي رياضي',
    'تمارين', 'تمرين', 'رياضة', 'لياقة', 'لياقة بدنية',
    'كمال اجسام', 'عضلات', 'تدريب',
    'يوغا', 'بيلاتيس', 'زومبا', 'كروس فيت',
    'مدرب شخصي', 'مدرب رياضي', 'كوتش',
    'سباحة', 'مسبح', 'حوض سباحة',
    'ملاكمة', 'كراتيه', 'جودو', 'فنون قتالية', 'ام ام ايه',
  ],
  salon: [
    'حلاق', 'صالون', 'صالون حلاقة', 'صالون تجميل', 'كوافير',
    'قص شعر', 'قصة', 'تسريحة', 'قصات',
    'مانيكير', 'بيديكير', 'مناكير', 'نقش',
    'ميك اب', 'مكياج', 'تجميل',
    'ازالة الشعر', 'شمع', 'ليزر',
    'تشقير', 'صبغ شعر', 'بلاشات', 'كيراتين',
    'لحية', 'حلاقة لحية', 'تشكيل اللحية',
    'رموش', 'حواجب', 'ميكروبليدينغ',
  ],
  clinic: [
    'عيادة', 'مستشفى', 'مركز طبي', 'طبيب', 'دكتور',
    'طبيب اسنان', 'اسنان', 'تقويم', 'طبيب اسنان',
    'صيدلية', 'دواء', 'صيدلاني',
    'تحاليل', 'تحليل دم', 'مختبر', 'مخبر',
    'علاج طبيعي', 'اشعة', 'فحص', 'كشف',
    'عيون', 'طبيب عيون', 'نظارة',
    'موعد طبي', 'استشارة', 'فحص دوري',
    'نفسي', 'طبيب نفسي', 'اخصائي',
  ],
  event: [
    'حفل', 'حفلة', 'عرس', 'زفاف', 'خطوبة', 'خطبة',
    'عيد ميلاد', 'مناسبة', 'احتفال', 'احتفالية',
    'قاعة', 'قاعة افراح', 'قاعة احداث', 'قاعة مناسبات',
    'مؤتمر', 'ندوة', 'اجتماع', 'ورشة عمل',
    'حفل موسيقي', 'عرض', 'مسرح', 'فرقة',
    'حفل استقبال', 'كوكتيل', 'غالا',
    'مهرجان', 'موسم', 'نشاط',
  ],
};

// ───────────────────────────────────────────────────────────────────────────
// SECTION 3 — SENTIMENT LEXICONS
// ───────────────────────────────────────────────────────────────────────────

export const SENTIMENT_POS: Record<Language, string[]> = {
  fr: [
    'bon', 'bonne', 'super', 'excellent', 'excellente', 'genial', 'geniale',
    'parfait', 'parfaite', 'bien', 'tres bien', 'content', 'contente',
    'satisfait', 'satisfaite', 'merci', 'formidable', 'magnifique',
    'bravo', 'felicitations', 'top', 'fantastique', 'impeccable',
    'delicieux', 'propre', 'rapide', 'ponctuel', 'professionnel',
    'accueillant', 'sympa', 'agreable', 'recommande', 'adore',
  ],
  en: [
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
    'nice', 'love', 'loved', 'perfect', 'awesome', 'brilliant',
    'satisfied', 'happy', 'pleased', 'recommend', 'best', 'top',
    'clean', 'fast', 'professional', 'friendly', 'welcoming', 'superb',
  ],
  tn: [
    'mzyan', 'mezian', 'mziana', 'behi', 'bahi', 'bahia',
    'ta7i', 'ta7ia', 'zorba', 'chokran', 'merci', 'bravo',
    '3la rasi', 'mli7', 'mliha', 'nqiya', 'ser3a', 'dghiya',
    'khatr', '9awi', 'zwina', 'e7la', 'a7la', 'a7la 7aga', 'a7sante',
  ],
  ar: [
    'ممتاز', 'ممتازة', 'رائع', 'رائعة', 'جيد', 'جيدة', 'جميل', 'جميلة',
    'شكرا', 'شكراً', 'احسنت', 'احسنتم', 'بارك الله فيك',
    'راضي', 'راضية', 'سعيد', 'سعيدة', 'نظيف', 'سريع', 'محترف',
    'انصح', 'انصح به', 'الافضل', 'مبسوط', 'يسلمو',
  ],
};

export const SENTIMENT_NEG: Record<Language, string[]> = {
  fr: [
    'mauvais', 'mauvaise', 'terrible', 'horrible', 'catastrophique',
    'decu', 'decue', 'decevant', 'decevante', 'probleme', 'problemes',
    'erreur', 'bug', 'panne', 'insatisfait', 'insatisfaite',
    'dommage', 'nul', 'nulle', 'mediocre', 'sale', 'lent',
    'retard', 'rude', 'impoli', 'arnaque', 'cher', 'honteux',
  ],
  en: [
    'bad', 'awful', 'terrible', 'horrible', 'disappointing', 'disgusting',
    'hate', 'hated', 'wrong', 'broken', 'problem', 'issue', 'error',
    'slow', 'rude', 'dirty', 'expensive', 'overpriced', 'scam',
    'unsatisfied', 'unhappy', 'disappointed', 'worst', 'never again',
  ],
  tn: [
    'khaib', 'khayeb', 'khayba', 'mich mzyan', 'mich behi',
    'wahesh', 'wahsha', 'khsar', 'tkhsir', 'ghali', 'ghalia',
    'mich normal', 'mayeslach', 'ma3ajbnich', 'mat3ajbnich',
    'batel', 'mayelzamch', 'mich e7la', 'khlasta', 'mziyenach',
  ],
  ar: [
    'سيء', 'سيئة', 'ردئ', 'ردئية', 'سيء جداً', 'مزعج',
    'خائب', 'مخيب للآمال', 'فاشل', 'مشكلة', 'خطأ',
    'غير راضي', 'غير راضية', 'مش كويس', 'غير محترف',
    'قذر', 'بطيء', 'غالي', 'مكلف', 'نصب', 'ما عجبنيش',
  ],
};

// ───────────────────────────────────────────────────────────────────────────
// SECTION 4 — LOCALIZATION (UI responses)
// ───────────────────────────────────────────────────────────────────────────

export const LOCALIZED_RESPONSES: Record<string, Record<Language, string | string[]>> = {
  search_no_results: {
    fr: "😕 Aucun service trouvé pour votre recherche.\n\nEssayez d'autres mots-clés ou une autre ville.",
    en: "😕 No services found for your search.\n\nTry different keywords or another city.",
    tn: "😕 Ma lqit chay.\n\nJreb krara okhra wala blasa okhra.",
    ar: "😕 لم يتم العثور على خدمات.\n\nجرب كلمات أخرى أو مدينة أخرى.",
  },
  search_error: {
    fr: "❌ Erreur lors de la recherche. Réessayez.",
    en: "❌ Error during search. Please try again.",
    tn: "❌ Mochkel fi el recherche. 3awed jareb.",
    ar: "❌ خطأ في البحث. حاول مرة أخرى.",
  },
  booking_no_login: {
    fr: "🔐 Connectez-vous pour faire une réservation.",
    en: "🔐 Please log in to make a reservation.",
    tn: "🔐 A3mel login bech te7jez.",
    ar: "🔐 سجل الدخول للحجز.",
  },
  booking_help: {
    fr: "📅 Je vais vous aider à réserver !\n\nQuel type de service cherchez-vous ?\n(restaurant, hôtel, spa, salon, salle de sport...)",
    en: "📅 Let me help you book!\n\nWhat type of service are you looking for?\n(restaurant, hotel, spa, salon, gym...)",
    tn: "📅 Na3awnek te7jez!\n\nChnowa l khedma li t7eb?\n(restaurant, otil, spa, salon, salle sport...)",
    ar: "📅 سأساعدك في الحجز!\n\nما نوع الخدمة التي تبحث عنها؟\n(مطعم، فندق، سبا، صالون، صالة رياضية...)",
  },
  greeting: {
    fr: ['👋 Bonjour ! Comment puis-je vous aider ?', '👋 Salut ! Besoin d\'aide pour trouver ou réserver un service ?', '👋 Bonjour ! Je suis votre assistant. Que puis-je faire pour vous ?'],
    en: ['👋 Hello! How can I help you today?', '👋 Hi there! Looking for something to book?', '👋 Good to see you! How can I assist?'],
    tn: ['👋 Ahla bik ! Kifeh n3awnek ?', '👋 Asslema ! T7eb t7ej wala tchouf chy ?', '👋 Marhba bik ! Chnowa t7eb ta3mel ?'],
    ar: ['👋 أهلاً وسهلاً! كيف أساعدك؟', '👋 مرحبا بك! كيف يمكنني مساعدتك اليوم؟', '👋 أهلين! تريد حجز ولا بحث عن خدمة؟'],
  },
  goodbye: {
    fr: ['👋 Au revoir ! Bonne journée !', '👋 À bientôt ! Prenez soin de vous !'],
    en: ['👋 Goodbye! Have a nice day!', '👋 See you later! Take care!'],
    tn: ['👋 Beslema! Nharek mabrouk!', '👋 Nrawahk! Yalla bkhir!'],
    ar: ['👋 مع السلامة! يوم سعيد!', '👋 إلى اللقاء! في أمان الله!'],
  },
  help: {
    fr: '🤖 **Je comprends le français, l\'anglais et la darija tunisienne**\n\n**Exemples :**\n🔍 "Cherche restaurant"\n📅 "Je veux réserver"\n❌ "Annuler ma réservation"\n⭐ "Donner mon avis"',
    en: '🤖 **I understand French, English, and Tunisian Arabic**\n\n**Examples:**\n🔍 "Find a restaurant"\n📅 "I want to book"\n❌ "Cancel my reservation"\n⭐ "Leave a review"',
    tn: '🤖 **Nafhem bel Faransawi, Anglais, w Tunisi**\n\n**Methal :**\n🔍 "Chouf restaurant"\n📅 "Nhejez"\n❌ "Batel hjezi"\n⭐ "A3ti ra2yek"',
    ar: '🤖 **أفهم الفرنسية والإنجليزية والعربية التونسية**\n\n**أمثلة:**\n🔍 "ابحث عن مطعم"\n📅 "أريد حجز"\n❌ "الغ حجزي"\n⭐ "اترك تقييم"',
  },
  unknown: {
    fr: "🤔 Je n'ai pas bien compris votre demande.\n\nEssayez :\n🔍 **Chercher** un service\n📅 **Réserver**\n❌ **Annuler**\n❓ **Aide**",
    en: "🤔 I didn't understand your request.\n\nTry:\n🔍 **Search** for a service\n📅 **Book**\n❌ **Cancel**\n❓ **Help**",
    tn: "🤔 Ma fhemtekch mizyana.\n\nJreb :\n🔍 **Chouf** service\n📅 **7ejjez**\n❌ **Batel**\n❓ **Mosa3da**",
    ar: "🤔 لم أفهم طلبك جيداً.\n\nجرب:\n🔍 **ابحث** عن خدمة\n📅 **احجز**\n❌ **الغ**\n❓ **مساعدة**",
  },
  cancel_no_login: {
    fr: "🔐 Connectez-vous pour annuler une réservation.",
    en: "🔐 Please log in to cancel a reservation.",
    tn: "🔐 A3mel login bech tbattel hejzek.",
    ar: "🔐 سجل الدخول لإلغاء الحجز.",
  },
  cancel_no_reservations: {
    fr: "✅ Vous n'avez aucune réservation active à annuler.",
    en: "✅ You have no active reservations to cancel.",
    tn: "✅ Ma3andekch 7ejz ta3tich.",
    ar: "✅ ليس لديك أي حجز نشط للإلغاء.",
  },
  feedback: {
    fr: "⭐ Merci de vouloir partager votre avis !\n\nPour quel service voulez-vous laisser un commentaire ?",
    en: "⭐ Thank you for wanting to share your feedback!\n\nWhich service would you like to review?",
    tn: "⭐ Chokran 3la ra2yek!\n\n3leh khidma tehb ta3ti ra2yek?",
    ar: "⭐ شكراً لرغبتك في مشاركة رأيك!\n\nلأي خدمة تريد ترك تعليق؟",
  },
  rate_limited: {
    fr: '⏳ Vous avez envoyé trop de messages. Attendez quelques secondes.',
    en: '⏳ You sent too many messages. Please wait a few seconds.',
    tn: '⏳ Barcha messages. Stanna chouya.',
    ar: '⏳ أرسلت رسائل كثيرة. انتظر بضع ثوانٍ.',
  },
  error: {
    fr: "😔 Désolé, une erreur s'est produite. Réessayez !",
    en: "😔 Sorry, an error occurred. Please try again!",
    tn: "😔 Désolé, mochkel. 3awed jareb!",
    ar: "😔 عذراً، حدث خطأ. حاول مرة أخرى!",
  },
  confirm_booking: {
    fr: "✅ Réservation confirmée ! Un email de confirmation vous a été envoyé.",
    en: "✅ Reservation confirmed! A confirmation email has been sent to you.",
    tn: "✅ Hejzek mzabt ! Email mcha 3andek.",
    ar: "✅ تم تأكيد الحجز! تم إرسال بريد إلكتروني للتأكيد.",
  },
};

// ───────────────────────────────────────────────────────────────────────────
// SECTION 5 — LANGUAGE DETECTION FINGERPRINTS
// ───────────────────────────────────────────────────────────────────────────

export const LANG_FINGERPRINTS: Record<Language, string[]> = {
  tn: [
    // mots très spécifiques au dialecte tunisien
    'mzyan', 'behi', 'bahi', 'ahla', 'beslema', 'nheb', 'wesh', 'kifesh',
    'nheji', 'hejez', 'nakol', 'labes', 'marhba', 'batel',
    '3aweni', 'chno', 'chnowa', 'kifash', 'nchouf', 'nchof',
    'yalla', 'baraka', 'hawali', 'qrib', 'fama', 'fayn',
    'mazyan', 'zorba', 'ta7i', '3andi', 'lazem',
    'fehem', 'waqef', 'ktibli', 'warrini',
  ],
  fr: [
    'bonjour', 'merci', 'reserver', 'cherche', 'comment', 'aide',
    'je', 'vous', 'nous', 'est', 'les', 'des', 'une', 'pour',
    'oui', 'non', 'avec', 'dans', 'plus', 'mais', 'bien',
  ],
  en: [
    'hello', 'thanks', 'book', 'search', 'find', 'help', 'how', 'good',
    'the', 'and', 'for', 'you', 'are', 'this', 'that', 'with',
    'yes', 'no', 'please', 'can', 'would', 'like', 'need',
  ],
  ar: [
    // mots arabes (détecté par le score Unicode principalement)
    'مرحبا', 'شكرا', 'احجز', 'ابحث', 'مساعدة', 'موعد',
    'الغاء', 'تقييم', 'اريد', 'كيف', 'اين', 'هل',
  ],
};

// ───────────────────────────────────────────────────────────────────────────
// SECTION 6 — TUNISIAN CITIES + DISTRICTS
// ───────────────────────────────────────────────────────────────────────────

export const TUNISIAN_CITIES: string[] = [
  // Grandes villes / Gouvernorats
  'tunis', 'sfax', 'sousse', 'monastir', 'bizerte', 'gabes',
  'gafsa', 'kairouan', 'nabeul', 'hammamet', 'djerba', 'houmt souk',
  'tozeur', 'nefta', 'mahdia', 'zaghouan', 'siliana', 'le kef',
  'jendouba', 'beja', 'medenine', 'tataouine', 'kebili', 'douz',
  // Banlieue de Tunis
  'ariana', 'la marsa', 'carthage', 'sidi bou said', 'la goulette',
  'manouba', 'ben arous', 'rades', 'hammam lif', 'hammam chott',
  'borj louzir', 'el manar', 'cite olympique', 'bab bhar', 'bab souika',
  'el menzah', 'el aouina', 'el ghazela', 'raoued', 'soukra',
  // Sfax et environs
  'sakiet eddaier', 'sakiet ezzit', 'chihia', 'thyna',
  'sfax centre', 'sfax ville', 'el ain', 'el bustan', 'merkez sfax',
  'la 15', 'la 16', 'lafrane', 'menzel chaker',
  // Sousse et environs
  'kantaoui', 'port el kantaoui', 'khezama', 'sahloul', 'msaken',
  'kalaa kebira', 'kalaa seghira', 'kondar',
  // Sahel
  'moknine', 'ksar hellal', 'ksibet', 'teboulba', 'jammel',
  'bembla', 'ouardanine',
  // Centre / Sud
  'sidi bouzid', 'kasserine', 'feriana', 'sbeitla',
  'remada', 'ghomrassen', 'zarzis', 'ben gardane', 'jerba',
  // Régions touristiques
  'midoun', 'aghir', 'el kantara', 'erriadh', 'ksar ghilane',
];

// ───────────────────────────────────────────────────────────────────────────
// SECTION 7 — PRICE / TIME / NEARBY PATTERNS
// ───────────────────────────────────────────────────────────────────────────

export const PRICE_PATTERNS: RegExp[] = [
  /(\d+(?:[.,]\d+)?)\s*(?:dt|dinar|dinars?|tnd)/i,
  /(\d+(?:[.,]\d+)?)\s*(?:euro?s?|eur|€)/i,
  /(\d+(?:[.,]\d+)?)\s*(?:dollar?s?|usd|\$)/i,
  /(?:moins de|max|maximum|pas plus de|jusqu[''a]\s*)\s*(\d+)/i,
  /(?:budget|environ|autour de)\s*(\d+)/i,
  /(\d+)\s*(?:د\.ت|دينار|دنانير)/,
  /(\d+)\s*(?:flousse?|flous)/i,
];

export const TIME_PATTERNS: RegExp[] = [
  /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
  /(\d{1,2})-(\d{1,2})-(\d{2,4})/,
  /(\d{1,2})\s*[h:]\s*(\d{0,2})/,
  /(?:demain|tomorrow|ghudwa|غداً?)/i,
  /(?:ce soir|tonight|llila|الليلة)/i,
  /(?:aujourd'?hui|today|lyoum|اليوم)/i,
  /(?:ce matin|this morning|الصباح)/i,
  /(?:cet apres-midi?|this afternoon|بعد الظهر)/i,
  /(?:cette semaine|this week|هذا الاسبوع)/i,
  /(?:ce weekend|this weekend|نهاية الاسبوع)/i,
  /(?:lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/i,
  /(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
  /(\d+)\s*(?:jours?|days?|أيام)/i,
];

export const NEAR_ME_PATTERNS: string[] = [
  'pres de moi', 'proche de moi', 'autour de moi', 'dans mon quartier',
  'a proximite', 'dans ma zone', 'ma position', 'ma localisation', 'ici',
  'near me', 'close to me', 'around me', 'nearby', 'in my area', 'my location',
  'hawali', 'qrib meni', 'grib meni', 'blasi', 'fi hwali', 'fi blesti',
  'قريب مني', 'حولي', 'بالقرب مني', 'في منطقتي', 'هنا',
];

export const PEOPLE_PATTERN =
  /(\d+)\s*(?:personnes?|gens?|pax|convives?|nafar|nefar|نفر|اشخاص|شخص|أشخاص|people|persons?|guests?|covers?)/i;