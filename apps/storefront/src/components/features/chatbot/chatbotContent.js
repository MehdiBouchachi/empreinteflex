/* ────────────────────────────────────────────────────────────────────────
   All chatbot copy, in FR / EN / AR, plus the guided-quiz tree and the FAQ.

   Self-contained (like WhatsAppFloatingButton) rather than living in the
   giant message JSONs — the quiz option values are coupled to the
   recommender's logic, so copy + structure stay together here.

   Question option `value`s are the machine codes the recommender reads.
   Size values MUST match the catalog's dimension labels ("90 x 190", …).
──────────────────────────────────────────────────────────────────────────── */

export const CHATBOT_CONFIG = {
  whatsappNumber: "213781404474",
  phoneDisplay: "0781 40 44 74",
  phoneTel: "+213781404474",
};

export const CHATBOT_LANGS = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "ar", label: "AR" },
];

const SIZES = ["90 x 190", "140 x 190", "160 x 190", "180 x 200"];

/* Intent keywords are intentionally multilingual — a visitor may type in any
   language regardless of the current page locale. Order matters: earlier
   keys win ties (so "bonjour, quel matelas ?" resolves to recommend). */
const INTENT_MATCH = [
  {
    key: "recommend",
    kw: [
      "recommand", "conseil", "aide", "help", "choisir", "choose", "which", "quel matelas",
      "best mattress", "mal de dos", "back pain", "besoin", "نصح", "ساعد", "اختيار", "أنصح",
      "توصية", "اقتراح", "أي مرتبة", "ظهر",
    ],
  },
  { key: "delivery", kw: ["livr", "deliver", "expédi", "shipping", "توصيل", "شحن", "wilaya", "ولاية"] },
  { key: "payment", kw: ["paie", "paye", "pay", "cash", "espèce", "دفع", "خلاص", "الدفع"] },
  { key: "warranty", kw: ["garanti", "warrant", "guarantee", "ضمان"] },
  {
    key: "sizesPrices",
    kw: [
      "prix", "price", "cost", "coût", "combien", "سعر", "ثمن", "بكم", "taille", "size",
      "dimension", "مقاس", "budget", "ميزانية",
    ],
  },
  {
    key: "materials",
    kw: [
      "matériau", "matiere", "material", "mousse", "foam", "ressort", "spring", "mémoire",
      "memory", "visco", "فيسكو", "نوابض", "إسفنج", "مواد", "مادة",
    ],
  },
  { key: "returns", kw: ["retour", "return", "échange", "exchange", "rembours", "refund", "إرجاع", "استبدال"] },
  { key: "track", kw: ["suivi", "suivre", "track", "commande", "order", "تتبع", "طلب", "livré"] },
  {
    key: "human",
    kw: [
      "conseiller", "humain", "agent", "advisor", "human", "person", "مستشار", "شخص", "موظف",
      "appel", "call", "téléphone", "whatsapp", "واتساب", "اتصال",
    ],
  },
  { key: "thanks", kw: ["merci", "thank", "شكرا", "متشكر", "يعطيك"] },
  { key: "greeting", kw: ["bonjour", "salut", "coucou", "hello", "hi ", "hey", "سلام", "مرحبا", "اهلا", "أهلا", "صباح", "مساء"] },
];

export function matchIntent(text) {
  const t = ` ${(text || "").toLowerCase()} `;
  let best = null;
  let bestHits = 0;
  for (const intent of INTENT_MATCH) {
    let hits = 0;
    for (const kw of intent.kw) if (t.includes(kw)) hits += 1;
    if (hits > bestHits) {
      bestHits = hits;
      best = intent.key;
    }
  }
  return bestHits > 0 ? best : "fallback";
}

/* ── Shared quiz option value sets (labels differ per locale) ──────────── */
const AUDIENCE = ["me", "couple", "child", "guest"];
const POSITION = ["back", "side", "stomach", "mixed"];
const FIRMNESS = ["soft", "balanced", "firm", "notsure"];
const MATERIAL = ["memory", "spring", "foam", "any"];
const NEEDS = ["back", "hot", "motion", "durable", "none"];
const BUDGET = ["lt30", "30_50", "50_70", "gt70", "flex"];

function opts(values, labels) {
  return values.map((value, i) => ({ value, label: labels[i] }));
}

/* ════════════════════════════════════════════════════════════════════════
   FRENCH (default)
════════════════════════════════════════════════════════════════════════ */
const fr = {
  dir: "ltr",
  launcherLabel: "Discuter avec l'assistant",
  title: "Assistant Empreinte Flex",
  online: "En ligne · répond en quelques secondes",
  restart: "Recommencer",
  close: "Fermer",
  greeting:
    "Bonjour 👋 Je suis l'assistant Empreinte Flex. Je peux vous aider à trouver le matelas idéal ou répondre à vos questions. Que puis-je faire pour vous ?",
  menu: {
    recommend: "Trouver mon matelas idéal",
    ask: "Poser une question",
    track: "Suivre ma commande",
    human: "Parler à un conseiller",
  },
  quiz: {
    intro: "Parfait ! Quelques questions rapides et je vous proposerai le meilleur choix de notre collection.",
    analyzing: "Un instant, je parcours notre collection…",
    questions: [
      { key: "audience", prompt: "Pour qui cherchez-vous un matelas ?", options: opts(AUDIENCE, ["Pour moi", "Un couple", "Un enfant / ado", "Chambre d'amis"]) },
      { key: "position", prompt: "Dans quelle position dormez-vous le plus souvent ?", options: opts(POSITION, ["Sur le dos", "Sur le côté", "Sur le ventre", "Ça varie"]) },
      { key: "firmness", prompt: "Quelle fermeté préférez-vous ?", options: opts(FIRMNESS, ["Moelleux", "Équilibré", "Ferme", "Je ne sais pas"]) },
      { key: "material", prompt: "Une préférence de technologie ?", options: opts(MATERIAL, ["Mousse à mémoire", "Ressorts", "Mousse classique", "Peu importe"]) },
      { key: "size", prompt: "Quelle taille de lit ?", options: [...opts(SIZES, SIZES), { value: "any", label: "Je ne sais pas" }] },
      { key: "budget", prompt: "Quel est votre budget ?", options: opts(BUDGET, ["Moins de 30 000 DA", "30 000 – 50 000 DA", "50 000 – 70 000 DA", "Plus de 70 000 DA", "Flexible"]) },
      { key: "needs", prompt: "Une priorité particulière ?", options: opts(NEEDS, ["Mal de dos / nuque", "Je dors chaud", "Ne pas sentir mon partenaire", "Durabilité maximale", "Aucune en particulier"]) },
    ],
  },
  result: {
    intro: "Voici ce que je recommande, d'après notre collection 👇",
    relaxed: "Aucun matelas n'entre exactement dans ce budget — voici les plus proches :",
    none: "Je n'ai pas trouvé de correspondance idéale. Un conseiller se fera un plaisir de vous aider.",
    from: "À partir de",
    firmnessLabels: { soft: "Moelleux", medium: "Équilibré", firm: "Ferme" },
    materialLabels: { foam: "Mousse classique", memory: "Mémoire de forme", spring: "Ressorts" },
    reasons: {
      firmness: "Correspond à la fermeté que vous préférez",
      material: "La technologie que vous avez choisie",
      backpain: "Mousse à mémoire : soulage la pression et soutient le dos",
      cool: "Ressorts respirants : reste frais toute la nuit",
      motion: "Excellente isolation des mouvements",
      coupleMotion: "Idéal en couple : peu de transfert de mouvement",
      durable: "Construction renforcée, conçue pour durer",
      kids: "Soutien stable et adapté aux enfants",
      value: "Excellent rapport qualité-prix",
      budget: "Dans votre budget",
      popular: "L'un de nos modèles les plus appréciés",
    },
    followups: { again: "Recommencer", seeAll: "Voir tous les matelas", human: "Un conseiller" },
    viewProduct: "Voir le produit",
  },
  faq: {
    prompt: "Bien sûr ! Choisissez un sujet ou écrivez votre question.",
    thanks: "Avec plaisir ! 😊 Puis-je vous aider pour autre chose ?",
    fallback:
      "Je peux vous aider à choisir un matelas, ou répondre sur la livraison, le paiement, la garantie, les tailles… Vous pouvez aussi parler à un conseiller.",
    topics: [
      { value: "delivery", label: "Livraison" },
      { value: "payment", label: "Paiement" },
      { value: "warranty", label: "Garantie" },
      { value: "sizesPrices", label: "Tailles & prix" },
      { value: "materials", label: "Matériaux" },
      { value: "returns", label: "Retour & échange" },
    ],
    answers: {
      delivery:
        "Nous livrons partout en Algérie. Le paiement se fait à la livraison (cash), et un conseiller vous appelle pour confirmer votre commande avant l'expédition.",
      payment:
        "Paiement à la livraison uniquement (cash). Vous réglez au moment où vous recevez votre matelas — aucun paiement en ligne n'est requis.",
      warranty: "Nos matelas sont garantis de 5 à 12 ans selon la gamme.",
      materials:
        "Trois familles : Mousse classique (D30 / D36), Multi-couches à mémoire de forme (Confort, Visco, Visco Plus) et Ressorts (Confort, Premium, Prestige).",
      returns:
        "Pour toute question de retour ou d'échange, notre équipe s'en occupe directement. Contactez-nous sur WhatsApp et on vous guide.",
    },
    priceTemplate:
      "Tailles disponibles : 90×190, 140×190, 160×190, 180×200. Nos matelas vont de {min} à {max}. Voulez-vous une recommandation personnalisée ?",
  },
  links: {
    trackText: "Vous pouvez suivre votre commande ici :",
    humanText: "Un conseiller est disponible sur WhatsApp — réponse rapide :",
    track: "Suivre ma commande",
    whatsapp: "WhatsApp",
    call: "Appeler",
    seeAll: "Voir tous les matelas",
    whatsappMsg: "Bonjour, j'aimerais un conseil pour choisir un matelas Empreinte Flex.",
  },
  input: { placeholder: "Écrivez votre message…", send: "Envoyer" },
  history: {
    open: "Historique",
    title: "Conversations précédentes",
    newChat: "Nouvelle conversation",
    empty: "Aucune conversation enregistrée pour le moment.",
    back: "Retour",
    delete: "Supprimer",
    readonly: "Conversation archivée · lecture seule",
    resume: "Nouvelle conversation",
  },
};

/* ════════════════════════════════════════════════════════════════════════
   ENGLISH
════════════════════════════════════════════════════════════════════════ */
const en = {
  dir: "ltr",
  launcherLabel: "Chat with the assistant",
  title: "Empreinte Flex Assistant",
  online: "Online · replies in seconds",
  restart: "Start over",
  close: "Close",
  greeting:
    "Hi 👋 I'm the Empreinte Flex assistant. I can help you find your ideal mattress or answer your questions. What can I do for you?",
  menu: {
    recommend: "Find my ideal mattress",
    ask: "Ask a question",
    track: "Track my order",
    human: "Talk to an advisor",
  },
  quiz: {
    intro: "Great! A few quick questions and I'll suggest the best match from our collection.",
    analyzing: "One moment, browsing our collection…",
    questions: [
      { key: "audience", prompt: "Who is the mattress for?", options: opts(AUDIENCE, ["For me", "A couple", "A child / teen", "Guest room"]) },
      { key: "position", prompt: "How do you usually sleep?", options: opts(POSITION, ["On my back", "On my side", "On my stomach", "It varies"]) },
      { key: "firmness", prompt: "What firmness do you prefer?", options: opts(FIRMNESS, ["Soft", "Balanced", "Firm", "Not sure"]) },
      { key: "material", prompt: "Any technology preference?", options: opts(MATERIAL, ["Memory foam", "Springs", "Classic foam", "No preference"]) },
      { key: "size", prompt: "What bed size?", options: [...opts(SIZES, SIZES), { value: "any", label: "Not sure" }] },
      { key: "budget", prompt: "What's your budget?", options: opts(BUDGET, ["Under 30,000 DA", "30,000 – 50,000 DA", "50,000 – 70,000 DA", "Over 70,000 DA", "Flexible"]) },
      { key: "needs", prompt: "Any particular priority?", options: opts(NEEDS, ["Back / neck pain", "I sleep hot", "Not feel my partner move", "Maximum durability", "Nothing in particular"]) },
    ],
  },
  result: {
    intro: "Here's what I recommend, based on our collection 👇",
    relaxed: "No mattress fits exactly within that budget — here are the closest:",
    none: "I couldn't find an ideal match. An advisor would be happy to help you.",
    from: "From",
    firmnessLabels: { soft: "Soft", medium: "Balanced", firm: "Firm" },
    materialLabels: { foam: "Classic foam", memory: "Memory foam", spring: "Springs" },
    reasons: {
      firmness: "Matches the firmness you prefer",
      material: "The technology you chose",
      backpain: "Memory foam relieves pressure and supports the back",
      cool: "Breathable springs keep you cool all night",
      motion: "Excellent motion isolation",
      coupleMotion: "Great for couples: little motion transfer",
      durable: "Reinforced build, made to last",
      kids: "Stable support, well-suited to children",
      value: "Excellent value for money",
      budget: "Within your budget",
      popular: "One of our most-loved models",
    },
    followups: { again: "Start over", seeAll: "See all mattresses", human: "An advisor" },
    viewProduct: "View product",
  },
  faq: {
    prompt: "Of course! Pick a topic or type your question.",
    thanks: "You're welcome! 😊 Anything else I can help with?",
    fallback:
      "I can help you choose a mattress, or answer about delivery, payment, warranty, sizes… You can also talk to an advisor.",
    topics: [
      { value: "delivery", label: "Delivery" },
      { value: "payment", label: "Payment" },
      { value: "warranty", label: "Warranty" },
      { value: "sizesPrices", label: "Sizes & prices" },
      { value: "materials", label: "Materials" },
      { value: "returns", label: "Return & exchange" },
    ],
    answers: {
      delivery:
        "We deliver across Algeria. Payment is cash on delivery, and an advisor calls you to confirm your order before shipping.",
      payment:
        "Cash on delivery only. You pay when you receive your mattress — no online payment required.",
      warranty: "Our mattresses come with a 5 to 12 year warranty depending on the range.",
      materials:
        "Three families: Classic foam (D30 / D36), Multi-layer memory foam (Confort, Visco, Visco Plus) and Springs (Confort, Premium, Prestige).",
      returns:
        "For any return or exchange, our team handles it directly. Message us on WhatsApp and we'll guide you.",
    },
    priceTemplate:
      "Available sizes: 90×190, 140×190, 160×190, 180×200. Our mattresses range from {min} to {max}. Would you like a personalized recommendation?",
  },
  links: {
    trackText: "You can track your order here:",
    humanText: "An advisor is available on WhatsApp — quick reply:",
    track: "Track my order",
    whatsapp: "WhatsApp",
    call: "Call",
    seeAll: "See all mattresses",
    whatsappMsg: "Hello, I'd like advice on choosing an Empreinte Flex mattress.",
  },
  input: { placeholder: "Type your message…", send: "Send" },
  history: {
    open: "History",
    title: "Past conversations",
    newChat: "New conversation",
    empty: "No saved conversations yet.",
    back: "Back",
    delete: "Delete",
    readonly: "Archived conversation · read-only",
    resume: "New conversation",
  },
};

/* ════════════════════════════════════════════════════════════════════════
   ARABIC (RTL)
════════════════════════════════════════════════════════════════════════ */
const ar = {
  dir: "rtl",
  launcherLabel: "الدردشة مع المساعد",
  title: "مساعد Empreinte Flex",
  online: "متصل · يرد خلال ثوانٍ",
  restart: "من جديد",
  close: "إغلاق",
  greeting:
    "مرحبًا 👋 أنا مساعد Empreinte Flex. يمكنني مساعدتك في اختيار المرتبة المثالية أو الإجابة عن أسئلتك. كيف أساعدك؟",
  menu: {
    recommend: "أجد المرتبة المثالية",
    ask: "لديّ سؤال",
    track: "تتبع طلبي",
    human: "التحدث مع مستشار",
  },
  quiz: {
    intro: "رائع! بضعة أسئلة سريعة وسأقترح عليك الأنسب من مجموعتنا.",
    analyzing: "لحظة من فضلك، أبحث في مجموعتنا…",
    questions: [
      { key: "audience", prompt: "لمن تبحث عن مرتبة؟", options: opts(AUDIENCE, ["لي", "لثنائي", "لطفل / مراهق", "لغرفة الضيوف"]) },
      { key: "position", prompt: "ما وضعية نومك المعتادة؟", options: opts(POSITION, ["على الظهر", "على الجنب", "على البطن", "تختلف"]) },
      { key: "firmness", prompt: "ما مستوى الصلابة المفضل؟", options: opts(FIRMNESS, ["وثيرة", "متوازنة", "صلبة", "لست متأكدًا"]) },
      { key: "material", prompt: "هل لديك تفضيل للتقنية؟", options: opts(MATERIAL, ["ميموري فوم", "نوابض", "إسفنج كلاسيكي", "لا يهم"]) },
      { key: "size", prompt: "ما مقاس السرير؟", options: [...opts(SIZES, SIZES), { value: "any", label: "لست متأكدًا" }] },
      { key: "budget", prompt: "ما ميزانيتك؟", options: opts(BUDGET, ["أقل من 30 000 دج", "30 000 – 50 000 دج", "50 000 – 70 000 دج", "أكثر من 70 000 دج", "مرنة"]) },
      { key: "needs", prompt: "هل من أولوية خاصة؟", options: opts(NEEDS, ["آلام الظهر / الرقبة", "أشعر بالحرارة أثناء النوم", "عدم الإحساس بحركة الشريك", "متانة قصوى", "لا شيء بالتحديد"]) },
    ],
  },
  result: {
    intro: "إليك ما أنصح به بناءً على مجموعتنا 👇",
    relaxed: "لا توجد مرتبة ضمن هذه الميزانية تمامًا — وإليك الأقرب:",
    none: "لم أجد تطابقًا مثاليًا. سيسعد أحد مستشارينا بمساعدتك.",
    from: "ابتداءً من",
    firmnessLabels: { soft: "وثيرة", medium: "متوازنة", firm: "صلبة" },
    materialLabels: { foam: "إسفنج كلاسيكي", memory: "ميموري فوم", spring: "نوابض" },
    reasons: {
      firmness: "يوافق مستوى الصلابة الذي تفضّله",
      material: "التقنية التي اخترتها",
      backpain: "ميموري فوم يخفّف الضغط ويدعم الظهر",
      cool: "نوابض جيدة التهوية تبقيك منتعشًا طوال الليل",
      motion: "عزل ممتاز للحركة",
      coupleMotion: "مثالي للثنائي: انتقال ضئيل للحركة",
      durable: "بنية معزّزة صُممت لتدوم",
      kids: "دعم ثابت ومناسب للأطفال",
      value: "قيمة ممتازة مقابل السعر",
      budget: "ضمن ميزانيتك",
      popular: "من أكثر موديلاتنا رواجًا",
    },
    followups: { again: "من جديد", seeAll: "كل المراتب", human: "مستشار" },
    viewProduct: "عرض المنتج",
  },
  faq: {
    prompt: "بكل تأكيد! اختر موضوعًا أو اكتب سؤالك.",
    thanks: "على الرحب والسعة! 😊 هل من شيء آخر أساعدك فيه؟",
    fallback:
      "يمكنني مساعدتك في اختيار مرتبة، أو الإجابة عن التوصيل والدفع والضمان والمقاسات… ويمكنك أيضًا التحدث مع مستشار.",
    topics: [
      { value: "delivery", label: "التوصيل" },
      { value: "payment", label: "الدفع" },
      { value: "warranty", label: "الضمان" },
      { value: "sizesPrices", label: "المقاسات والأسعار" },
      { value: "materials", label: "المواد" },
      { value: "returns", label: "الإرجاع والاستبدال" },
    ],
    answers: {
      delivery:
        "نُوصّل إلى جميع ولايات الجزائر. الدفع عند الاستلام (نقدًا)، ويتصل بك مستشار لتأكيد الطلب قبل الشحن.",
      payment:
        "الدفع عند الاستلام فقط (نقدًا). تدفع عند استلام مرتبتك — لا حاجة لأي دفع إلكتروني.",
      warranty: "مراتبنا مضمونة من 5 إلى 12 سنة حسب الفئة.",
      materials:
        "ثلاث عائلات: إسفنج كلاسيكي (D30 / D36)، متعددة الطبقات بميموري فوم (كونفورت، فيسكو، فيسكو بلس)، ونوابض (كونفور، بريميوم، بريستيج).",
      returns:
        "لأي طلب إرجاع أو استبدال، يتولى فريقنا الأمر مباشرة. تواصل معنا عبر واتساب وسنرشدك.",
    },
    priceTemplate:
      "المقاسات المتوفرة: 90×190، 140×190، 160×190، 180×200. تتراوح أسعار مراتبنا من {min} إلى {max}. هل تريد توصية مخصّصة؟",
  },
  links: {
    trackText: "يمكنك تتبع طلبك من هنا:",
    humanText: "أحد المستشارين متاح على واتساب — رد سريع:",
    track: "تتبع طلبي",
    whatsapp: "واتساب",
    call: "اتصال",
    seeAll: "كل المراتب",
    whatsappMsg: "مرحبًا، أرغب في نصيحة لاختيار مرتبة Empreinte Flex.",
  },
  input: { placeholder: "اكتب رسالتك…", send: "إرسال" },
  history: {
    open: "السجل",
    title: "المحادثات السابقة",
    newChat: "محادثة جديدة",
    empty: "لا توجد محادثات محفوظة بعد.",
    back: "رجوع",
    delete: "حذف",
    readonly: "محادثة محفوظة · للعرض فقط",
    resume: "محادثة جديدة",
  },
};

const CONTENT = { fr, en, ar };

export function getChatbotContent(locale) {
  return CONTENT[locale] || CONTENT.fr;
}
