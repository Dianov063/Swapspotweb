import localeComplements from "./i18n-complements.json";

export const locales = [
  "en",
  "es",
  "zh",
  "fr",
  "ru",
  "ar",
  "pt",
  "ht",
  "de",
  "fil",
  "hi",
  "bn",
  "te",
  "ta",
  "vi",
  "th",
] as const;

export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  zh: "中文",
  fr: "Français",
  ru: "Русский",
  ar: "العربية",
  pt: "Português",
  ht: "Kreyòl Ayisyen",
  de: "Deutsch",
  fil: "Filipino",
  hi: "हिन्दी",
  bn: "বাংলা",
  te: "తెలుగు",
  ta: "தமிழ்",
  vi: "Tiếng Việt",
  th: "ไทย",
};

export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function localizedPath(locale: Locale, path: string) {
  if (locale === defaultLocale) return path;
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}

const en = {
  metaTitle: "SwapSpot - Find Trusted Local Help Near You",
  metaDescription:
    "Book trusted local helpers for cleaning, repairs, beauty, lawn care, moving, pet care, senior care, tutoring, and more.",
  nav: {
    how: "How it works",
    clients: "For Clients",
    pricing: "Pricing",
    categories: "Categories",
    helpers: "For Helpers",
    trust: "Trust & Safety",
    getApp: "Get the app",
  },
  hero: {
    badge: "Now launching in your neighborhood",
    before: "Find",
    highlight: "trusted local help",
    after: "near you",
    body:
      "Book cleaning, repairs, beauty, lawn care, moving help, pet care and more from one neighborhood marketplace.",
    findHelp: "Find Help",
    becomeHelper: "Become a Helper",
    rating: "from 2,300+ neighbors · 1,200 helpers nearby",
    review: "Booked a handyman down the street in 10 minutes.",
    reviewer: "David · 1 mi away",
    bookingConfirmed: "Booking confirmed",
    bookingMeta: "Lawn care · Sat 9:00 AM",
  },
  how: {
    eyebrow: "How it works",
    title: "Help is three taps away",
    body:
      "From I need this done to it is booked, without phone tag, guesswork, or unclear quotes.",
  },
  steps: [
    ["Search nearby helpers", "See trusted local helpers on a live map, sorted by distance and rating."],
    ["Compare services and prices", "Browse profiles, services, and transparent pricing before you commit."],
    ["Book, chat and pay safely", "Message, get a quote, and pay securely inside the app."],
  ],
  helpers: {
    eyebrow: "For Helpers",
    title: "Turn your skills into local income",
    body: "Set up once and start getting booked by neighbors who already need exactly what you do.",
    start: "Start as a Helper",
    earnings: "Earnings this week",
    bookings: "3 new bookings",
    quotes: "2 quotes awaiting reply",
  },
  perks: [
    ["Create your service profile", "List your skills, photos, and work area in minutes."],
    ["Set your prices and availability", "You control your rates, radius, and schedule."],
    ["Receive bookings and send quotes", "Get nearby requests and reply with custom quotes."],
    ["Build reviews and repeat clients", "Earn ratings that turn first jobs into regulars."],
  ],
  categories: {
    eyebrow: "Categories",
    title: "Whatever the job, there is a helper",
    body: "Core local service categories at launch, with more added as each market grows.",
    nearby: "nearby",
    names: {
      cleaning: "Cleaning",
      handyman: "Handyman",
      plumbing: "Plumbing",
      electrical: "Electrical",
      "lawn-garden": "Lawn & Garden",
      "nails-beauty": "Nails & Beauty",
      moving: "Moving",
      "pet-care": "Pet Care",
      "senior-care": "Senior Care",
      tutoring: "Tutoring",
    },
  },
  trust: {
    eyebrow: "Trust & Safety",
    title: "Built to feel safe on both sides",
    body: "Real reviews, private messaging, and controls that keep neighbors in charge of their own data.",
  },
  trustItems: [
    ["Verified reviews", "Real ratings from real neighbors after every job."],
    ["In-app chat", "Keep conversations and quotes in one place."],
    ["Report and block", "Flag or block any user anytime."],
    ["Account deletion", "Delete your account and data whenever you choose."],
    ["Location privacy", "Helpers control how their location is shown."],
  ],
  waitlist: {
    title: "Download SwapSpot today",
    body: "Browse nearby helpers for free. Use a pass when you are ready to message, request quotes, or book.",
    email: "Email address",
    placeholder: "you@email.com",
    join: "Download app",
    thanks: "Thanks, you are on the list.",
    storeCaption: "Available now on iOS and Android",
    comingSoon: "Available on",
    noSpam: "Download the app, browse helpers, and start when you are ready.",
  },
  download: {
    badge: "Available now",
    title: "Download SwapSpot for iOS or Android",
    body:
      "Browse nearby helpers for free. Use a pass when you are ready to message, request quotes, or book.",
    pointA: "Clients and helpers welcome",
    pointB: "Free browsing before you contact a helper",
  },
  footer: {
    tagline: "The neighborhood marketplace for trusted local help. Made for communities across the US.",
    product: "Product",
    company: "Company",
    about: "About",
    contact: "Contact",
    privacy: "Privacy",
    support: "Support",
    accountDeletion: "Account deletion",
    terms: "Terms",
    pricingPayouts: "Pricing & payouts",
    rights: "© 2026 SwapSpot. All rights reserved.",
    bottom: "Find trusted local help near you.",
    companyLine: "Operating under USPROJECT LLC · EIN 83-3989558 · New York, USA",
  },
};

type DictionaryShape = typeof en;
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? T[K]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

function mergeDictionary(overrides: DeepPartial<DictionaryShape>): DictionaryShape {
  return {
    ...en,
    ...overrides,
    nav: { ...en.nav, ...overrides.nav },
    hero: { ...en.hero, ...overrides.hero },
    how: { ...en.how, ...overrides.how },
    helpers: { ...en.helpers, ...overrides.helpers },
    categories: {
      ...en.categories,
      ...overrides.categories,
      names: { ...en.categories.names, ...overrides.categories?.names },
    },
    trust: { ...en.trust, ...overrides.trust },
    waitlist: { ...en.waitlist, ...overrides.waitlist },
    download: { ...en.download, ...overrides.download },
    footer: { ...en.footer, ...overrides.footer },
  };
}

export const dictionaries: Record<Locale, DictionaryShape> = {
  en,
  es: mergeDictionary({
    metaTitle: "SwapSpot - Encuentra ayuda local de confianza cerca de ti",
    metaDescription: "Reserva helpers locales para limpieza, reparaciones, belleza, jardín, mudanzas, mascotas, adultos mayores, tutorías y más.",
    nav: { how: "Cómo funciona", clients: "Para clientes", pricing: "Precios", categories: "Categorías", helpers: "Para Helpers", trust: "Confianza y seguridad", getApp: "Obtener la app" },
    hero: { badge: "Lanzando en tu vecindario", before: "Encuentra", highlight: "ayuda local confiable", after: "cerca de ti", body: "Reserva limpieza, reparaciones, belleza, jardín, mudanzas, mascotas y más desde un marketplace del vecindario.", findHelp: "Buscar ayuda", becomeHelper: "Ser Helper", bookingConfirmed: "Reserva confirmada" },
    how: { eyebrow: "Cómo funciona", title: "Ayuda en tres toques", body: "De necesito ayuda a reservado, sin llamadas largas ni cotizaciones confusas." },
    steps: [["Busca helpers cercanos", "Ve helpers confiables en un mapa en vivo."], ["Compara servicios y precios", "Revisa perfiles, servicios y precios antes de reservar."], ["Reserva, chatea y paga", "Envía mensajes, recibe quotes y paga en la app."]],
    helpers: { eyebrow: "Para Helpers", title: "Convierte tus habilidades en ingresos locales", body: "Configura tu perfil y recibe reservas de vecinos que necesitan tus servicios.", start: "Empezar como Helper", earnings: "Ganancias esta semana", bookings: "3 reservas nuevas", quotes: "2 quotes pendientes" },
    perks: [["Crea tu perfil", "Publica habilidades, fotos y zona de trabajo."], ["Define precios y horario", "Controlas tarifas, radio y disponibilidad."], ["Recibe reservas", "Responde solicitudes cercanas con quotes."], ["Construye reseñas", "Gana reputación y clientes recurrentes."]],
    categories: { eyebrow: "Categorías", title: "Para cada trabajo hay un helper", body: "Categorías locales principales, con más a medida que crece cada mercado.", nearby: "cerca", names: { cleaning: "Limpieza", handyman: "Handyman", plumbing: "Plomería", electrical: "Electricidad", "lawn-garden": "Jardín", "nails-beauty": "Belleza", moving: "Mudanzas", "pet-care": "Mascotas", "senior-care": "Adultos mayores", tutoring: "Tutorías" } },
    trust: { eyebrow: "Confianza y seguridad", title: "Diseñado para sentirse seguro en ambos lados", body: "Reseñas reales, chat privado y controles de datos." },
    trustItems: [["Reseñas verificadas", "Calificaciones reales después de cada trabajo."], ["Chat en la app", "Conversaciones y quotes en un lugar."], ["Reportar y bloquear", "Reporta o bloquea usuarios cuando quieras."], ["Eliminar cuenta", "Elimina tu cuenta y datos."], ["Privacidad de ubicación", "Los helpers controlan cómo se muestra su ubicación."]],
    waitlist: { title: "Descarga SwapSpot hoy", body: "Explora helpers gratis. Usa un pass para escribir, pedir quotes o reservar.", join: "Descargar app", storeCaption: "Disponible en iOS y Android", noSpam: "Descarga la app y empieza cuando estés listo." },
    download: { badge: "Disponible ahora", title: "Descarga SwapSpot para iOS o Android", body: "Explora helpers gratis. Usa un pass para escribir, pedir quotes o reservar.", pointA: "Clientes y helpers son bienvenidos", pointB: "Exploración gratis antes de contactar" },
    footer: { product: "Producto", company: "Compañía", contact: "Contacto", privacy: "Privacidad", support: "Soporte", accountDeletion: "Eliminar cuenta", terms: "Términos", pricingPayouts: "Precios y pagos", bottom: "Encuentra ayuda local confiable cerca de ti." },
  }),
  zh: mergeDictionary({
    metaTitle: "SwapSpot - 寻找附近可信赖的本地帮手",
    metaDescription: "预订清洁、维修、美容、庭院、搬家、宠物护理、老人护理、辅导等本地服务。",
    nav: { how: "如何使用", clients: "给客户", pricing: "价格", categories: "服务类别", helpers: "给 Helpers", trust: "信任与安全", getApp: "获取应用" },
    hero: { badge: "正在你的社区上线", before: "寻找", highlight: "可信赖的本地帮手", after: "就在附近", body: "在一个社区 marketplace 中预订清洁、维修、美容、庭院、搬家、宠物护理等服务。", findHelp: "寻找帮助", becomeHelper: "成为 Helper", bookingConfirmed: "预订已确认" },
    how: { eyebrow: "如何使用", title: "三步即可获得帮助", body: "从需要帮助到完成预订，减少电话、猜价和不确定性。" },
    steps: [["搜索附近 helpers", "在实时地图上查看可信赖的本地 helpers。"], ["比较服务和价格", "预订前查看资料、服务和透明价格。"], ["预订、聊天和付款", "在应用内发送消息、获取 quote 并付款。"]],
    helpers: { eyebrow: "给 Helpers", title: "把技能变成本地收入", body: "设置一次资料，让附近需要服务的客户找到你。", start: "开始成为 Helper" },
    categories: { title: "各种需求，都能找到 helper", nearby: "附近", names: { cleaning: "清洁", handyman: "维修", plumbing: "管道", electrical: "电工", "lawn-garden": "庭院", "nails-beauty": "美容", moving: "搬家", "pet-care": "宠物护理", "senior-care": "老人护理", tutoring: "辅导" } },
    trust: { eyebrow: "信任与安全", title: "让双方都安心的设计", body: "真实评价、私密聊天和数据控制。" },
    waitlist: { title: "立即下载 SwapSpot", body: "免费浏览附近 helpers。准备联系、询价或预订时使用 pass。", join: "下载应用", storeCaption: "现已支持 iOS 和 Android" },
    download: { badge: "现已上线", title: "下载 iOS 或 Android 版 SwapSpot", body: "免费浏览附近 helpers。准备联系、询价或预订时使用 pass。", pointA: "客户和 helpers 都可使用", pointB: "联系前可免费浏览" },
    footer: { product: "产品", company: "公司", contact: "联系", privacy: "隐私", support: "支持", accountDeletion: "删除账户", terms: "条款", bottom: "寻找附近可信赖的本地帮手。" },
  }),
  fr: mergeDictionary({
    metaTitle: "SwapSpot - Trouvez de l'aide locale fiable près de vous",
    metaDescription: "Réservez des helpers locaux pour ménage, réparations, beauté, jardin, déménagement, animaux, seniors, tutorat et plus.",
    nav: { how: "Comment ça marche", clients: "Pour clients", pricing: "Tarifs", categories: "Catégories", helpers: "Pour Helpers", trust: "Sécurité", getApp: "Obtenir l'app" },
    hero: { badge: "Lancement dans votre quartier", before: "Trouvez", highlight: "de l'aide locale fiable", after: "près de vous", body: "Réservez ménage, réparations, beauté, jardin, déménagement, animaux et plus depuis une marketplace de quartier.", findHelp: "Trouver de l'aide", becomeHelper: "Devenir Helper", bookingConfirmed: "Réservation confirmée" },
    how: { eyebrow: "Comment ça marche", title: "De l'aide en trois clics", body: "De besoin d'aide à réservé, sans appels longs ni devis confus." },
    steps: [["Cherchez des helpers proches", "Voyez les helpers fiables sur une carte."], ["Comparez services et prix", "Consultez profils, services et tarifs."], ["Réservez, discutez et payez", "Messagez, recevez un quote et payez dans l'app."]],
    helpers: { eyebrow: "Pour Helpers", title: "Transformez vos compétences en revenu local", body: "Créez votre profil et recevez des réservations de voisins.", start: "Commencer comme Helper" },
    categories: { title: "Quel que soit le besoin, il y a un helper", nearby: "proches", names: { cleaning: "Ménage", handyman: "Handyman", plumbing: "Plomberie", electrical: "Électricité", "lawn-garden": "Jardin", "nails-beauty": "Beauté", moving: "Déménagement", "pet-care": "Animaux", "senior-care": "Aide senior", tutoring: "Tutorat" } },
    trust: { eyebrow: "Confiance et sécurité", title: "Conçu pour rassurer les deux côtés", body: "Avis réels, messagerie privée et contrôle des données." },
    waitlist: { title: "Téléchargez SwapSpot aujourd'hui", body: "Parcourez les helpers gratuitement. Utilisez un pass pour écrire, demander un quote ou réserver.", join: "Télécharger l'app", storeCaption: "Disponible sur iOS et Android" },
    download: { badge: "Disponible maintenant", title: "Téléchargez SwapSpot pour iOS ou Android", body: "Parcourez les helpers gratuitement. Utilisez un pass pour écrire, demander un quote ou réserver.", pointA: "Clients et helpers bienvenus", pointB: "Navigation gratuite avant contact" },
    footer: { product: "Produit", company: "Entreprise", contact: "Contact", privacy: "Confidentialité", support: "Support", accountDeletion: "Suppression du compte", terms: "Conditions", bottom: "Trouvez de l'aide locale fiable près de vous." },
  }),
  ru: mergeDictionary({
    metaTitle: "SwapSpot - Найдите надежных местных исполнителей рядом",
    metaDescription: "Находите местных исполнителей для уборки, ремонта, ухода за садом и питомцами, переезда, помощи пожилым, занятий с репетитором и других задач.",
    nav: { how: "Как работает", clients: "Для клиентов", pricing: "Цены", categories: "Категории", helpers: "Для исполнителей", trust: "Безопасность", getApp: "Скачать приложение" },
    hero: { badge: "Уже в вашем районе", before: "Найдите", highlight: "надежных местных исполнителей", after: "рядом", body: "Заказывайте уборку, ремонт, уход за садом и питомцами, переезд и другие услуги в одном приложении.", findHelp: "Найти исполнителя", becomeHelper: "Стать исполнителем", bookingConfirmed: "Бронирование подтверждено" },
    how: { eyebrow: "Как работает", title: "Помощь в три шага", body: "От поиска до бронирования — без долгих звонков и непонятных расчетов." },
    steps: [["Найдите исполнителей рядом", "Смотрите проверенных местных исполнителей на карте."], ["Сравните услуги и цены", "Изучите профили, услуги и цены до бронирования."], ["Бронируйте, общайтесь и платите", "Переписка, расчет стоимости и оплата внутри приложения."]],
    helpers: { eyebrow: "Для исполнителей", title: "Превратите навыки в дополнительный доход", body: "Настройте профиль и получайте заказы от клиентов рядом.", start: "Стать исполнителем", earnings: "Доход за неделю", bookings: "3 новых бронирования", quotes: "2 запроса ждут ответа" },
    categories: { title: "Для любой задачи найдется исполнитель", nearby: "рядом", names: { cleaning: "Уборка", handyman: "Мастер на все руки", plumbing: "Сантехника", electrical: "Электрика", "lawn-garden": "Сад и газон", "nails-beauty": "Красота", moving: "Переезд", "pet-care": "Питомцы", "senior-care": "Помощь пожилым", tutoring: "Репетиторы" } },
    trust: { eyebrow: "Доверие и безопасность", title: "Спокойно для обеих сторон", body: "Реальные отзывы, приватный чат и контроль данных." },
    waitlist: { title: "Скачайте SwapSpot сегодня", body: "Просматривайте исполнителей бесплатно. Доступ понадобится, только чтобы написать, запросить стоимость или забронировать услугу.", join: "Скачать приложение", storeCaption: "Доступно на iOS и Android" },
    download: { badge: "Уже доступно", title: "Скачайте SwapSpot для iOS или Android", body: "Просматривайте исполнителей бесплатно. Доступ понадобится, только чтобы написать, запросить стоимость или забронировать услугу.", pointA: "Для клиентов и исполнителей", pointB: "Бесплатный просмотр до обращения" },
    footer: { product: "Продукт", company: "Компания", contact: "Контакты", privacy: "Конфиденциальность", support: "Поддержка", accountDeletion: "Удаление аккаунта", terms: "Условия", pricingPayouts: "Цены и выплаты", bottom: "Найдите надежного местного исполнителя рядом." },
  }),
  ar: mergeDictionary({
    metaTitle: "SwapSpot - اعثر على مساعدة محلية موثوقة بالقرب منك",
    nav: { how: "كيف يعمل", clients: "للعملاء", pricing: "الأسعار", categories: "الفئات", helpers: "للمساعدين", trust: "الأمان", getApp: "حمّل التطبيق" },
    hero: { before: "اعثر على", highlight: "مساعدة محلية موثوقة", after: "بالقرب منك", body: "احجز التنظيف والإصلاحات والجمال والحدائق والنقل ورعاية الحيوانات والمزيد.", findHelp: "ابحث عن مساعدة", becomeHelper: "كن مساعدا" },
    how: { eyebrow: "كيف يعمل", title: "المساعدة بثلاث خطوات", body: "ابحث، قارن، ثم احجز داخل التطبيق." },
    download: { badge: "متاح الآن", title: "حمّل SwapSpot على iOS أو Android", body: "تصفح المساعدين مجانا واستخدم pass عند المراسلة أو الحجز.", pointA: "للعملاء والمساعدين", pointB: "تصفح مجاني قبل التواصل" },
    waitlist: { title: "حمّل SwapSpot اليوم", body: "تصفح المساعدين مجانا واستخدم pass عند المراسلة أو الحجز.", join: "حمّل التطبيق", storeCaption: "متاح على iOS و Android" },
    footer: { product: "المنتج", company: "الشركة", contact: "اتصال", privacy: "الخصوصية", support: "الدعم", terms: "الشروط", bottom: "اعثر على مساعدة محلية موثوقة بالقرب منك." },
  }),
  pt: mergeDictionary({
    metaTitle: "SwapSpot - Encontre ajuda local confiável perto de você",
    nav: { how: "Como funciona", clients: "Para clientes", pricing: "Preços", categories: "Categorias", helpers: "Para Helpers", trust: "Segurança", getApp: "Baixar app" },
    hero: { before: "Encontre", highlight: "ajuda local confiável", after: "perto de você", body: "Reserve limpeza, reparos, beleza, jardim, mudança, pets e mais.", findHelp: "Encontrar ajuda", becomeHelper: "Virar Helper" },
    how: { eyebrow: "Como funciona", title: "Ajuda em três toques", body: "Procure, compare e reserve pelo app." },
    download: { badge: "Disponível agora", title: "Baixe SwapSpot para iOS ou Android", body: "Explore helpers grátis. Use um pass para conversar, pedir quotes ou reservar.", pointA: "Clientes e helpers bem-vindos", pointB: "Exploração grátis antes do contato" },
    waitlist: { title: "Baixe SwapSpot hoje", body: "Explore helpers grátis. Use um pass para conversar, pedir quotes ou reservar.", join: "Baixar app", storeCaption: "Disponível em iOS e Android" },
    footer: { product: "Produto", company: "Empresa", contact: "Contato", privacy: "Privacidade", support: "Suporte", terms: "Termos", bottom: "Encontre ajuda local confiável perto de você." },
  }),
  ht: mergeDictionary({
    metaTitle: "SwapSpot - Jwenn èd lokal ou ka fè konfyans toupre ou",
    nav: { how: "Kijan li mache", clients: "Pou kliyan", pricing: "Pri", categories: "Kategori", helpers: "Pou Helpers", trust: "Sekirite", getApp: "Telechaje app la" },
    hero: { before: "Jwenn", highlight: "èd lokal ou ka fè konfyans", after: "toupre ou", body: "Rezève netwayaj, reparasyon, bote, jaden, demenajman, swen bèt ak plis.", findHelp: "Jwenn èd", becomeHelper: "Vin Helper" },
    how: { eyebrow: "Kijan li mache", title: "Èd nan twa etap", body: "Chèche, konpare, epi rezève nan app la." },
    download: { badge: "Disponib kounye a", title: "Telechaje SwapSpot pou iOS oswa Android", body: "Gade helpers gratis. Sèvi ak pass lè ou vle ekri oswa rezève.", pointA: "Kliyan ak helpers akeyi", pointB: "Gade gratis avan kontak" },
    waitlist: { title: "Telechaje SwapSpot jodi a", body: "Gade helpers gratis. Sèvi ak pass lè ou vle ekri oswa rezève.", join: "Telechaje app la", storeCaption: "Disponib sou iOS ak Android" },
    footer: { product: "Pwodwi", company: "Konpayi", contact: "Kontak", privacy: "Konfidansyalite", support: "Sipò", terms: "Tèm", bottom: "Jwenn èd lokal ou ka fè konfyans toupre ou." },
  }),
  de: mergeDictionary({
    metaTitle: "SwapSpot - Finde vertrauenswürdige lokale Hilfe in deiner Nähe",
    nav: { how: "So funktioniert es", clients: "Für Kunden", pricing: "Preise", categories: "Kategorien", helpers: "Für Helpers", trust: "Sicherheit", getApp: "App laden" },
    hero: { before: "Finde", highlight: "vertrauenswürdige lokale Hilfe", after: "in deiner Nähe", body: "Buche Reinigung, Reparaturen, Beauty, Garten, Umzug, Tierbetreuung und mehr.", findHelp: "Hilfe finden", becomeHelper: "Helper werden" },
    how: { eyebrow: "So funktioniert es", title: "Hilfe in drei Schritten", body: "Suchen, vergleichen und in der App buchen." },
    download: { badge: "Jetzt verfügbar", title: "SwapSpot für iOS oder Android laden", body: "Durchsuche Helpers kostenlos. Nutze einen Pass zum Schreiben, Anfragen oder Buchen.", pointA: "Für Kunden und Helpers", pointB: "Kostenlos stöbern vor dem Kontakt" },
    waitlist: { title: "SwapSpot heute laden", body: "Durchsuche Helpers kostenlos. Nutze einen Pass zum Schreiben, Anfragen oder Buchen.", join: "App laden", storeCaption: "Verfügbar für iOS und Android" },
    footer: { product: "Produkt", company: "Unternehmen", contact: "Kontakt", privacy: "Datenschutz", support: "Support", terms: "Bedingungen", bottom: "Finde vertrauenswürdige lokale Hilfe in deiner Nähe." },
  }),
  fil: mergeDictionary({
    metaTitle: "SwapSpot - Maghanap ng mapagkakatiwalaang lokal na tulong malapit sa iyo",
    nav: { how: "Paano ito gumagana", clients: "Para sa Clients", pricing: "Presyo", categories: "Mga kategorya", helpers: "Para sa Helpers", trust: "Trust & Safety", getApp: "Kunin ang app" },
    hero: { before: "Maghanap ng", highlight: "mapagkakatiwalaang lokal na tulong", after: "malapit sa iyo", body: "Mag-book ng cleaning, repairs, beauty, garden, moving, pet care at iba pa.", findHelp: "Maghanap ng tulong", becomeHelper: "Maging Helper" },
    how: { eyebrow: "Paano ito gumagana", title: "Tulong sa tatlong tap", body: "Maghanap, magkumpara, at mag-book sa app." },
    download: { badge: "Available na", title: "I-download ang SwapSpot para sa iOS o Android", body: "Mag-browse ng helpers nang libre. Gumamit ng pass para mag-message o mag-book.", pointA: "Para sa clients at helpers", pointB: "Libreng browse bago makipag-contact" },
    waitlist: { title: "I-download ang SwapSpot ngayon", body: "Mag-browse ng helpers nang libre. Gumamit ng pass para mag-message o mag-book.", join: "I-download ang app", storeCaption: "Available sa iOS at Android" },
    footer: { product: "Produkto", company: "Kompanya", contact: "Kontak", privacy: "Privacy", support: "Suporta", terms: "Mga tuntunin", bottom: "Maghanap ng mapagkakatiwalaang lokal na tulong malapit sa iyo." },
  }),
  hi: mergeDictionary({
    metaTitle: "SwapSpot - अपने पास भरोसेमंद स्थानीय मदद पाएं",
    nav: { how: "कैसे काम करता है", clients: "क्लाइंट्स के लिए", pricing: "कीमत", categories: "श्रेणियां", helpers: "Helpers के लिए", trust: "सुरक्षा", getApp: "ऐप डाउनलोड करें" },
    hero: { before: "पाएं", highlight: "भरोसेमंद स्थानीय मदद", after: "अपने पास", body: "क्लीनिंग, रिपेयर, ब्यूटी, गार्डन, मूविंग, पेट केयर और अधिक बुक करें।", findHelp: "मदद पाएं", becomeHelper: "Helper बनें" },
    how: { eyebrow: "कैसे काम करता है", title: "तीन टैप में मदद", body: "खोजें, तुलना करें और ऐप में बुक करें।" },
    download: { badge: "अब उपलब्ध", title: "iOS या Android के लिए SwapSpot डाउनलोड करें", body: "Helpers को मुफ्त देखें। मैसेज, quote या booking के लिए pass इस्तेमाल करें।", pointA: "Clients और helpers दोनों के लिए", pointB: "संपर्क से पहले मुफ्त browsing" },
    waitlist: { title: "आज SwapSpot डाउनलोड करें", body: "Helpers को मुफ्त देखें। मैसेज, quote या booking के लिए pass इस्तेमाल करें।", join: "ऐप डाउनलोड करें", storeCaption: "iOS और Android पर उपलब्ध" },
    footer: { product: "प्रोडक्ट", company: "कंपनी", contact: "संपर्क", privacy: "गोपनीयता", support: "सहायता", terms: "शर्तें", bottom: "अपने पास भरोसेमंद स्थानीय मदद पाएं।" },
  }),
  bn: mergeDictionary({
    metaTitle: "SwapSpot - আপনার কাছাকাছি বিশ্বস্ত স্থানীয় সাহায্য খুঁজুন",
    nav: { how: "কীভাবে কাজ করে", clients: "ক্লায়েন্টদের জন্য", pricing: "দাম", categories: "ক্যাটাগরি", helpers: "Helpers এর জন্য", trust: "নিরাপত্তা", getApp: "অ্যাপ ডাউনলোড" },
    hero: { before: "খুঁজুন", highlight: "বিশ্বস্ত স্থানীয় সাহায্য", after: "আপনার কাছে", body: "ক্লিনিং, রিপেয়ার, বিউটি, গার্ডেন, মুভিং, পেট কেয়ার এবং আরও বুক করুন।", findHelp: "সাহায্য খুঁজুন", becomeHelper: "Helper হন" },
    how: { eyebrow: "কীভাবে কাজ করে", title: "তিন ধাপে সাহায্য", body: "খুঁজুন, তুলনা করুন এবং অ্যাপে বুক করুন।" },
    download: { badge: "এখন উপলব্ধ", title: "iOS বা Android এর জন্য SwapSpot ডাউনলোড করুন", body: "Helpers বিনামূল্যে দেখুন। মেসেজ বা বুকিংয়ের জন্য pass ব্যবহার করুন।", pointA: "Clients এবং helpers স্বাগতম", pointB: "যোগাযোগের আগে বিনামূল্যে browsing" },
    waitlist: { title: "আজই SwapSpot ডাউনলোড করুন", body: "Helpers বিনামূল্যে দেখুন। মেসেজ বা বুকিংয়ের জন্য pass ব্যবহার করুন।", join: "অ্যাপ ডাউনলোড", storeCaption: "iOS এবং Android এ উপলব্ধ" },
    footer: { product: "প্রোডাক্ট", company: "কোম্পানি", contact: "যোগাযোগ", privacy: "গোপনীয়তা", support: "সহায়তা", terms: "শর্তাবলী", bottom: "আপনার কাছাকাছি বিশ্বস্ত স্থানীয় সাহায্য খুঁজুন।" },
  }),
  te: mergeDictionary({
    metaTitle: "SwapSpot - మీ దగ్గర నమ్మదగిన స్థానిక సహాయం కనుగొనండి",
    metaDescription: "క్లీనింగ్, మరమ్మతులు, బ్యూటీ, తోటపని, మూవింగ్, పెట్ కేర్, సీనియర్ కేర్, ట్యూటరింగ్ మరియు మరిన్ని సేవల కోసం నమ్మదగిన స్థానిక హెల్పర్లను బుక్ చేయండి.",
    nav: { how: "ఎలా పనిచేస్తుంది", clients: "క్లయింట్ల కోసం", pricing: "ధరలు", categories: "వర్గాలు", helpers: "సహాయకుల కోసం", trust: "భద్రత", getApp: "యాప్ పొందండి" },
    hero: { badge: "ఇప్పుడు మీ పరిసరాల్లో ప్రారంభమవుతోంది", before: "కనుగొనండి", highlight: "నమ్మదగిన స్థానిక సహాయం", after: "మీ దగ్గర", body: "క్లీనింగ్, రిపేర్, బ్యూటీ, గార్డెన్, మూవింగ్, పెట్ కేర్ మరియు మరిన్ని బుక్ చేయండి.", findHelp: "సహాయం కనుగొనండి", becomeHelper: "హెల్పర్ అవ్వండి", rating: "2,300+ పొరుగువారి నుంచి · సమీపంలో 1,200 హెల్పర్లు", review: "పది నిమిషాల్లోనే దగ్గరలో ఉన్న హ్యాండీమ్యాన్‌ను బుక్ చేశాను.", reviewer: "డేవిడ్ · 1 మైలు దూరంలో", bookingConfirmed: "బుకింగ్ నిర్ధారించబడింది", bookingMeta: "లాన్ కేర్ · శని ఉదయం 9:00" },
    how: { eyebrow: "ఎలా పనిచేస్తుంది", title: "మూడు ట్యాప్‌లలో సహాయం", body: "వెతకండి, పోల్చండి, యాప్‌లో బుక్ చేయండి." },
    steps: [
      ["సమీపంలోని హెల్పర్లను వెతకండి", "దూరం మరియు రేటింగ్ ఆధారంగా అమర్చిన నమ్మదగిన స్థానిక హెల్పర్లను లైవ్ మ్యాప్‌లో చూడండి."],
      ["సేవలు మరియు ధరలను పోల్చండి", "బుక్ చేసే ముందు ప్రొఫైళ్లు, సేవలు మరియు స్పష్టమైన ధరలను చూడండి."],
      ["బుక్ చేయండి, చాట్ చేయండి, సురక్షితంగా చెల్లించండి", "యాప్‌లోనే మెసేజ్ పంపండి, కోట్ పొందండి మరియు సురక్షితంగా చెల్లించండి."],
    ],
    helpers: { eyebrow: "హెల్పర్ల కోసం", title: "మీ నైపుణ్యాలను స్థానిక ఆదాయంగా మార్చుకోండి", body: "ఒక్కసారి ప్రొఫైల్ సెటప్ చేసి, మీ సేవలు అవసరమైన సమీపంలోని కస్టమర్ల నుంచి బుకింగ్‌లు పొందండి.", start: "హెల్పర్‌గా ప్రారంభించండి", earnings: "ఈ వారం ఆదాయం", bookings: "3 కొత్త బుకింగ్‌లు", quotes: "సమాధానం కోసం 2 కోట్లు" },
    perks: [
      ["మీ సేవా ప్రొఫైల్‌ను సృష్టించండి", "మీ నైపుణ్యాలు, ఫోటోలు మరియు పని ప్రాంతాన్ని నిమిషాల్లో జోడించండి."],
      ["ధరలు మరియు అందుబాటును నిర్ణయించండి", "మీ రేట్లు, సేవా పరిధి మరియు షెడ్యూల్‌పై మీకే నియంత్రణ."],
      ["బుకింగ్‌లు పొందండి మరియు కోట్లు పంపండి", "సమీపంలోని అభ్యర్థనలకు మీ స్వంత కోట్‌తో స్పందించండి."],
      ["రివ్యూలు మరియు రెగ్యులర్ క్లయింట్లను పెంచుకోండి", "మొదటి పనులను మళ్లీ వచ్చే కస్టమర్లుగా మార్చే రేటింగ్‌లు పొందండి."],
    ],
    categories: { eyebrow: "వర్గాలు", title: "ఏ పని అయినా, దానికి ఒక హెల్పర్ ఉన్నారు", body: "ప్రతి మార్కెట్ పెరుగుతున్న కొద్దీ మరిన్ని సేవలు జోడించబడే ప్రధాన స్థానిక సేవా వర్గాలు.", nearby: "సమీపంలో", names: { cleaning: "క్లీనింగ్", handyman: "హ్యాండీమ్యాన్", plumbing: "ప్లంబింగ్", electrical: "ఎలక్ట్రికల్", "lawn-garden": "లాన్ & గార్డెన్", "nails-beauty": "నెయిల్స్ & బ్యూటీ", moving: "మూవింగ్", "pet-care": "పెట్ కేర్", "senior-care": "సీనియర్ కేర్", tutoring: "ట్యూటరింగ్" } },
    trust: { eyebrow: "నమ్మకం & భద్రత", title: "ఇరువురికీ సురక్షితంగా అనిపించేలా రూపొందించబడింది", body: "నిజమైన రివ్యూలు, ప్రైవేట్ మెసేజింగ్ మరియు ప్రతి ఒక్కరూ తమ డేటాపై నియంత్రణలో ఉండే సాధనాలు." },
    trustItems: [
      ["ధృవీకరించిన రివ్యూలు", "ప్రతి పని తర్వాత నిజమైన పొరుగువారి నుంచి నిజమైన రేటింగ్‌లు."],
      ["యాప్‌లో చాట్", "సంభాషణలు మరియు కోట్లను ఒకే చోట ఉంచండి."],
      ["రిపోర్ట్ చేసి బ్లాక్ చేయండి", "ఏ వినియోగదారునైనా ఎప్పుడైనా రిపోర్ట్ చేయండి లేదా బ్లాక్ చేయండి."],
      ["ఖాతా తొలగింపు", "మీకు కావాలనుకున్నప్పుడు మీ ఖాతా మరియు డేటాను తొలగించండి."],
      ["లొకేషన్ గోప్యత", "తమ లొకేషన్ ఎలా కనిపించాలో హెల్పర్లు నియంత్రిస్తారు."],
    ],
    download: { badge: "ఇప్పుడు అందుబాటులో", title: "iOS లేదా Android కోసం SwapSpot డౌన్‌లోడ్ చేయండి", body: "సహాయకులను ఉచితంగా చూడండి. మెసేజ్, కోట్ లేదా బుకింగ్ కోసం పాస్ ఉపయోగించండి.", pointA: "క్లయింట్లు మరియు సహాయకులకు స్వాగతం", pointB: "సంప్రదించే ముందు ఉచితంగా చూడండి" },
    waitlist: { title: "ఈరోజే SwapSpot డౌన్‌లోడ్ చేయండి", body: "హెల్పర్లను ఉచితంగా చూడండి. మెసేజ్, కోట్ లేదా బుకింగ్‌కు పాస్ వాడండి.", email: "ఇమెయిల్ చిరునామా", placeholder: "you@email.com", join: "యాప్ డౌన్‌లోడ్", thanks: "ధన్యవాదాలు.", storeCaption: "iOS మరియు Android లో అందుబాటులో", comingSoon: "ఇక్కడ అందుబాటులో", noSpam: "యాప్‌ను డౌన్‌లోడ్ చేసి, హెల్పర్లను చూడండి, సిద్ధమైనప్పుడు ప్రారంభించండి." },
    footer: { tagline: "నమ్మదగిన స్థానిక సహాయం కోసం పొరుగువారి మార్కెట్‌ప్లేస్.", product: "ప్రోడక్ట్", company: "కంపెనీ", contact: "సంప్రదించండి", about: "మా గురించి", privacy: "గోప్యత", support: "సహాయం", terms: "నిబంధనలు", accountDeletion: "ఖాతా తొలగింపు", pricingPayouts: "ధరలు & చెల్లింపులు", rights: "© 2026 SwapSpot. అన్ని హక్కులు రిజర్వ్ చేయబడ్డాయి.", companyLine: "USPROJECT LLC ఆధ్వర్యంలో · EIN 83-3989558 · న్యూయార్క్, USA", bottom: "మీ దగ్గర నమ్మదగిన స్థానిక సహాయం కనుగొనండి." },
  }),
  ta: mergeDictionary({
    metaTitle: "SwapSpot - உங்கள் அருகில் நம்பகமான உள்ளூர் உதவி கண்டுபிடிக்கவும்",
    nav: { how: "எப்படி வேலை செய்கிறது", clients: "Clients க்காக", pricing: "விலை", categories: "வகைகள்", helpers: "Helpers க்காக", trust: "பாதுகாப்பு", getApp: "ஆப் பதிவிறக்கவும்" },
    hero: { before: "கண்டுபிடிக்கவும்", highlight: "நம்பகமான உள்ளூர் உதவி", after: "உங்கள் அருகில்", body: "Cleaning, repair, beauty, garden, moving, pet care மற்றும் பலவற்றை book செய்யுங்கள்.", findHelp: "உதவி தேடுங்கள்", becomeHelper: "Helper ஆகுங்கள்" },
    how: { eyebrow: "எப்படி வேலை செய்கிறது", title: "மூன்று tap-ல் உதவி", body: "தேடுங்கள், ஒப்பிடுங்கள், app-ல் book செய்யுங்கள்." },
    download: { badge: "இப்போது கிடைக்கிறது", title: "iOS அல்லது Android க்கு SwapSpot பதிவிறக்கவும்", body: "Helpers ஐ இலவசமாக பாருங்கள். Message அல்லது booking க்கு pass பயன்படுத்துங்கள்.", pointA: "Clients மற்றும் helpers வரவேற்கப்படுகிறார்கள்", pointB: "தொடர்புக்கு முன் இலவச browsing" },
    waitlist: { title: "இன்றே SwapSpot பதிவிறக்கவும்", body: "Helpers ஐ இலவசமாக பாருங்கள். Message அல்லது booking க்கு pass பயன்படுத்துங்கள்.", join: "ஆப் பதிவிறக்கவும்", storeCaption: "iOS மற்றும் Android இல் கிடைக்கிறது" },
    footer: { product: "தயாரிப்பு", company: "நிறுவனம்", contact: "தொடர்பு", privacy: "தனியுரிமை", support: "உதவி", terms: "விதிமுறைகள்", bottom: "உங்கள் அருகில் நம்பகமான உள்ளூர் உதவி கண்டுபிடிக்கவும்." },
  }),
  vi: mergeDictionary({
    metaTitle: "SwapSpot - Tìm người trợ giúp địa phương đáng tin cậy gần bạn",
    metaDescription: "Đặt người trợ giúp địa phương cho dọn dẹp, sửa chữa, làm đẹp, chăm sóc sân vườn, chuyển nhà, chăm sóc thú cưng, người cao tuổi, gia sư và nhiều hơn nữa.",
    nav: { how: "Cách hoạt động", clients: "Dành cho khách hàng", pricing: "Bảng giá", categories: "Danh mục", helpers: "Dành cho người trợ giúp", trust: "Tin cậy & An toàn", getApp: "Tải ứng dụng" },
    hero: { badge: "Hiện đã có mặt tại khu vực của bạn", before: "Tìm", highlight: "sự trợ giúp địa phương đáng tin cậy", after: "gần bạn", body: "Đặt dịch vụ dọn dẹp, sửa chữa, làm đẹp, chăm sóc sân vườn, chuyển nhà, thú cưng và nhiều hơn nữa trong một ứng dụng.", findHelp: "Tìm trợ giúp", becomeHelper: "Trở thành người trợ giúp", rating: "từ hơn 2.300 hàng xóm · 1.200 người trợ giúp gần đây", review: "Tôi đã đặt thợ sửa chữa gần nhà chỉ trong 10 phút.", reviewer: "David · cách 1 dặm", bookingConfirmed: "Đặt lịch thành công", bookingMeta: "Chăm sóc sân vườn · Thứ Bảy 9:00" },
    how: { eyebrow: "Cách hoạt động", title: "Nhận trợ giúp chỉ trong ba bước", body: "Tìm kiếm, so sánh và đặt lịch mà không cần gọi điện nhiều lần hay đoán giá." },
    steps: [
      ["Tìm người trợ giúp gần bạn", "Xem người trợ giúp đáng tin cậy trên bản đồ, được sắp xếp theo khoảng cách và đánh giá."],
      ["So sánh dịch vụ và giá", "Xem hồ sơ, dịch vụ và mức giá rõ ràng trước khi quyết định."],
      ["Đặt lịch, nhắn tin và thanh toán an toàn", "Nhắn tin, nhận báo giá và thanh toán an toàn trong ứng dụng."],
    ],
    helpers: { eyebrow: "Dành cho người trợ giúp", title: "Biến kỹ năng của bạn thành thu nhập tại địa phương", body: "Tạo hồ sơ một lần và bắt đầu nhận việc từ những người hàng xóm đang cần đúng dịch vụ của bạn.", start: "Bắt đầu làm người trợ giúp", earnings: "Thu nhập tuần này", bookings: "3 lịch đặt mới", quotes: "2 báo giá đang chờ trả lời" },
    perks: [
      ["Tạo hồ sơ dịch vụ", "Thêm kỹ năng, ảnh và khu vực làm việc chỉ trong vài phút."],
      ["Đặt giá và lịch làm việc", "Bạn kiểm soát mức giá, bán kính và thời gian làm việc."],
      ["Nhận lịch đặt và gửi báo giá", "Nhận yêu cầu gần bạn và trả lời bằng báo giá riêng."],
      ["Xây dựng đánh giá và khách hàng thường xuyên", "Nhận đánh giá để biến công việc đầu tiên thành khách hàng lâu dài."],
    ],
    categories: { eyebrow: "Danh mục", title: "Mọi công việc đều có người trợ giúp phù hợp", body: "Các nhóm dịch vụ địa phương chính, với nhiều dịch vụ mới được thêm khi thị trường phát triển.", nearby: "gần đây", names: { cleaning: "Dọn dẹp", handyman: "Sửa chữa nhà", plumbing: "Sửa ống nước", electrical: "Điện", "lawn-garden": "Sân vườn", "nails-beauty": "Làm đẹp", moving: "Chuyển nhà", "pet-care": "Chăm sóc thú cưng", "senior-care": "Chăm sóc người cao tuổi", tutoring: "Gia sư" } },
    trust: { eyebrow: "Tin cậy & An toàn", title: "An tâm cho cả hai phía", body: "Đánh giá thật, tin nhắn riêng tư và các công cụ giúp mọi người kiểm soát dữ liệu của mình." },
    trustItems: [
      ["Đánh giá đã xác minh", "Đánh giá thật từ khách hàng thật sau mỗi công việc."],
      ["Nhắn tin trong ứng dụng", "Giữ cuộc trò chuyện và báo giá ở cùng một nơi."],
      ["Báo cáo và chặn", "Báo cáo hoặc chặn bất kỳ người dùng nào bất cứ lúc nào."],
      ["Xóa tài khoản", "Xóa tài khoản và dữ liệu khi bạn muốn."],
      ["Quyền riêng tư vị trí", "Người trợ giúp kiểm soát cách vị trí của họ được hiển thị."],
    ],
    download: { badge: "Đã có sẵn", title: "Tải SwapSpot cho iOS hoặc Android", body: "Xem người trợ giúp gần bạn miễn phí. Dùng pass khi bạn muốn nhắn tin, yêu cầu báo giá hoặc đặt lịch.", pointA: "Dành cho cả khách hàng và người trợ giúp", pointB: "Xem miễn phí trước khi liên hệ" },
    waitlist: { title: "Tải SwapSpot ngay hôm nay", body: "Xem người trợ giúp gần bạn miễn phí. Dùng pass khi bạn muốn nhắn tin, yêu cầu báo giá hoặc đặt lịch.", email: "Địa chỉ email", placeholder: "you@email.com", join: "Tải ứng dụng", thanks: "Cảm ơn bạn.", storeCaption: "Đã có trên iOS và Android", comingSoon: "Có sẵn trên", noSpam: "Tải ứng dụng, xem người trợ giúp và bắt đầu khi bạn sẵn sàng." },
    footer: { tagline: "Nền tảng cộng đồng để tìm sự trợ giúp địa phương đáng tin cậy.", product: "Sản phẩm", company: "Công ty", about: "Giới thiệu", contact: "Liên hệ", privacy: "Quyền riêng tư", support: "Hỗ trợ", accountDeletion: "Xóa tài khoản", terms: "Điều khoản", pricingPayouts: "Giá & thanh toán", bottom: "Tìm sự trợ giúp địa phương đáng tin cậy gần bạn." },
  }),
  th: mergeDictionary({
    metaTitle: "SwapSpot - ค้นหาผู้ช่วยในพื้นที่ที่ไว้ใจได้ใกล้คุณ",
    metaDescription: "จองผู้ช่วยในพื้นที่สำหรับทำความสะอาด ซ่อมแซม ความงาม ดูแลสวน ย้ายบ้าน ดูแลสัตว์เลี้ยง ดูแลผู้สูงอายุ ติวเตอร์ และอื่น ๆ",
    nav: { how: "วิธีใช้งาน", clients: "สำหรับลูกค้า", pricing: "ราคา", categories: "หมวดหมู่", helpers: "สำหรับผู้ช่วย", trust: "ความไว้วางใจและความปลอดภัย", getApp: "ดาวน์โหลดแอป" },
    hero: { badge: "เปิดให้บริการในพื้นที่ของคุณแล้ว", before: "ค้นหา", highlight: "ความช่วยเหลือในพื้นที่ที่ไว้ใจได้", after: "ใกล้คุณ", body: "จองบริการทำความสะอาด ซ่อมแซม ความงาม ดูแลสวน ย้ายบ้าน ดูแลสัตว์เลี้ยง และอื่น ๆ ในแอปเดียว", findHelp: "ค้นหาความช่วยเหลือ", becomeHelper: "สมัครเป็นผู้ช่วย", rating: "จากเพื่อนบ้านกว่า 2,300 คน · ผู้ช่วย 1,200 คนใกล้คุณ", review: "จองช่างซ่อมใกล้บ้านได้ใน 10 นาที", reviewer: "David · ห่าง 1 ไมล์", bookingConfirmed: "ยืนยันการจองแล้ว", bookingMeta: "ดูแลสวน · เสาร์ 9:00 น." },
    how: { eyebrow: "วิธีใช้งาน", title: "รับความช่วยเหลือได้ในสามขั้นตอน", body: "ค้นหา เปรียบเทียบ และจองโดยไม่ต้องโทรหลายครั้งหรือเดาราคา" },
    steps: [
      ["ค้นหาผู้ช่วยใกล้คุณ", "ดูผู้ช่วยที่ไว้ใจได้บนแผนที่ เรียงตามระยะทางและคะแนน"],
      ["เปรียบเทียบบริการและราคา", "ดูโปรไฟล์ บริการ และราคาที่ชัดเจนก่อนตัดสินใจ"],
      ["จอง แชต และชำระเงินอย่างปลอดภัย", "ส่งข้อความ ขอใบเสนอราคา และชำระเงินอย่างปลอดภัยในแอป"],
    ],
    helpers: { eyebrow: "สำหรับผู้ช่วย", title: "เปลี่ยนทักษะของคุณให้เป็นรายได้ในพื้นที่", body: "สร้างโปรไฟล์ครั้งเดียว แล้วเริ่มรับงานจากเพื่อนบ้านที่กำลังต้องการบริการของคุณ", start: "เริ่มเป็นผู้ช่วย", earnings: "รายได้สัปดาห์นี้", bookings: "การจองใหม่ 3 รายการ", quotes: "ใบเสนอราคา 2 รายการรอตอบกลับ" },
    perks: [
      ["สร้างโปรไฟล์บริการ", "เพิ่มทักษะ รูปภาพ และพื้นที่ทำงานได้ในไม่กี่นาที"],
      ["กำหนดราคาและเวลาว่าง", "คุณควบคุมราคา รัศมี และตารางงานของคุณเอง"],
      ["รับการจองและส่งใบเสนอราคา", "รับคำขอใกล้คุณและตอบกลับด้วยราคาที่กำหนดเอง"],
      ["สร้างรีวิวและลูกค้าประจำ", "รับคะแนนที่ช่วยเปลี่ยนงานแรกให้เป็นลูกค้าประจำ"],
    ],
    categories: { eyebrow: "หมวดหมู่", title: "ไม่ว่างานอะไร ก็มีผู้ช่วยที่เหมาะสม", body: "หมวดหมู่บริการหลักในพื้นที่ พร้อมเพิ่มบริการใหม่เมื่อแต่ละตลาดเติบโต", nearby: "ใกล้คุณ", names: { cleaning: "ทำความสะอาด", handyman: "ช่างซ่อมบ้าน", plumbing: "ประปา", electrical: "ไฟฟ้า", "lawn-garden": "สนามและสวน", "nails-beauty": "เล็บและความงาม", moving: "ย้ายบ้าน", "pet-care": "ดูแลสัตว์เลี้ยง", "senior-care": "ดูแลผู้สูงอายุ", tutoring: "ติวเตอร์" } },
    trust: { eyebrow: "ความไว้วางใจและความปลอดภัย", title: "ออกแบบมาให้ทั้งสองฝ่ายรู้สึกปลอดภัย", body: "รีวิวจริง ข้อความส่วนตัว และเครื่องมือที่ให้ทุกคนควบคุมข้อมูลของตนเอง" },
    trustItems: [
      ["รีวิวที่ยืนยันแล้ว", "คะแนนจริงจากลูกค้าจริงหลังจบทุกงาน"],
      ["แชตในแอป", "เก็บบทสนทนาและใบเสนอราคาไว้ในที่เดียว"],
      ["รายงานและบล็อก", "รายงานหรือบล็อกผู้ใช้ได้ทุกเมื่อ"],
      ["ลบบัญชี", "ลบบัญชีและข้อมูลของคุณได้เมื่อคุณต้องการ"],
      ["ความเป็นส่วนตัวของตำแหน่ง", "ผู้ช่วยควบคุมวิธีแสดงตำแหน่งของตนเอง"],
    ],
    download: { badge: "พร้อมให้ดาวน์โหลด", title: "ดาวน์โหลด SwapSpot สำหรับ iOS หรือ Android", body: "ดูผู้ช่วยใกล้คุณได้ฟรี ใช้ pass เมื่อพร้อมส่งข้อความ ขอใบเสนอราคา หรือจอง", pointA: "ยินดีต้อนรับทั้งลูกค้าและผู้ช่วย", pointB: "ดูก่อนได้ฟรีก่อนติดต่อผู้ช่วย" },
    waitlist: { title: "ดาวน์โหลด SwapSpot วันนี้", body: "ดูผู้ช่วยใกล้คุณได้ฟรี ใช้ pass เมื่อพร้อมส่งข้อความ ขอใบเสนอราคา หรือจอง", email: "อีเมล", placeholder: "you@email.com", join: "ดาวน์โหลดแอป", thanks: "ขอบคุณ", storeCaption: "พร้อมใช้งานบน iOS และ Android", comingSoon: "พร้อมใช้งานบน", noSpam: "ดาวน์โหลดแอป ดูผู้ช่วย และเริ่มเมื่อคุณพร้อม" },
    footer: { tagline: "ตลาดชุมชนสำหรับความช่วยเหลือในพื้นที่ที่ไว้ใจได้", product: "ผลิตภัณฑ์", company: "บริษัท", about: "เกี่ยวกับเรา", contact: "ติดต่อ", privacy: "ความเป็นส่วนตัว", support: "ช่วยเหลือ", accountDeletion: "ลบบัญชี", terms: "ข้อกำหนด", pricingPayouts: "ราคาและการจ่ายเงิน", bottom: "ค้นหาความช่วยเหลือในพื้นที่ที่ไว้ใจได้ใกล้คุณ" },
  }),
};

function mergeLocalizedValues<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base;

  if (Array.isArray(base) && Array.isArray(override)) {
    return base.map((value, index) =>
      override[index] === undefined || override[index] === null
        ? value
        : mergeLocalizedValues(value, override[index]),
    ) as T;
  }

  if (
    base &&
    override &&
    typeof base === "object" &&
    typeof override === "object" &&
    !Array.isArray(base)
  ) {
    const merged = { ...(base as Record<string, unknown>) };
    for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
      merged[key] = mergeLocalizedValues(merged[key], value);
    }
    return merged as T;
  }

  return override as T;
}

for (const [locale, overrides] of Object.entries(localeComplements)) {
  const localeKey = locale as Locale;
  dictionaries[localeKey] = mergeLocalizedValues(dictionaries[localeKey], overrides);
}

export type Dictionary = DictionaryShape;
