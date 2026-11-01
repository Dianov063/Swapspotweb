// Copy of the home page pricing section (components/ClientPricing.tsx) in the 16 site languages.
// Pure module (type-only import) so `npm run test:intl` can check that every locale is complete.
// "Client Pro" is the product name and stays as is.
import { extraLocaleTables } from "./extraLocales";
import type { Locale, ShippedLocale } from "./locales";

export type ClientPricingCopy = {
    eyebrow: string;
    title: string;
    body: string;
    freeTitle: string;
    freeBody: string;
    unlock: string;
    plans: {
      name: string;
      note: string;
      best?: string;
      features: string[];
      cta: string;
    }[];
    actions: string[];
  };

export const clientPricingCopy: Record<ShippedLocale, ClientPricingCopy> = {
  en: {
    eyebrow: "Client Pricing",
    title: "Browse for free. Use a pass when you are ready to act.",
    body:
      "Clients can explore categories and compare helpers without paying. A pass is needed to message, request a quote, or book a helper. Payment for the job itself is arranged directly with the helper.",
    freeTitle: "Free browsing",
    freeBody: "See categories, helper previews, service areas, and basic trust signals before choosing a pass.",
    unlock: "A pass unlocks",
    actions: ["Messaging helpers", "Requesting quotes", "Booking jobs"],
    plans: [
      {
        name: "Day Pass",
        note: "Best for one task, urgent help, or trying SwapSpot.",
        features: ["Message helpers for the day", "Request quotes", "Book when you are ready"],
        cta: "Get Day Pass",
      },
      {
        name: "Client Pro",
        note: "Best for regular home, family, rental, or business needs.",
        best: "Best value",
        features: ["Monthly access", "Message and request quotes anytime", "Better value after 5 active days"],
        cta: "Start Pro",
      },
    ],
  },
  es: {
    eyebrow: "Precios para clientes",
    title: "Explora gratis. Usa un pass cuando quieras actuar.",
    body:
      "Los clientes pueden ver categorías y comparar helpers sin pagar. Se necesita un pass para escribir, pedir quote o reservar. El pago del trabajo se acuerda directamente con el helper.",
    freeTitle: "Explorar gratis",
    freeBody: "Mira categorías, previews de helpers, áreas de servicio y señales básicas de confianza antes de elegir un pass.",
    unlock: "Un pass desbloquea",
    actions: ["Mensajes a helpers", "Solicitar quotes", "Reservar trabajos"],
    plans: [
      {
        name: "Pase de un día",
        note: "Para una tarea, ayuda urgente o probar SwapSpot.",
        features: ["Escribe a helpers durante el día", "Solicita quotes", "Reserva cuando estés listo"],
        cta: "Obtener pase de un día",
      },
      {
        name: "Client Pro",
        note: "Para casa, familia, renta o negocio con necesidades frecuentes.",
        best: "Mejor valor",
        features: ["Acceso mensual", "Mensajes y quotes cuando quieras", "Mejor valor después de 5 días activos"],
        cta: "Empezar Pro",
      },
    ],
  },
  zh: {
    eyebrow: "客户价格",
    title: "免费浏览。准备行动时再使用 pass。",
    body:
      "客户可以免费浏览类别并比较 helpers。发送消息、请求 quote 或预订 helper 时需要 pass。工作费用的支付方式由你与 helper 直接商定。",
    freeTitle: "免费浏览",
    freeBody: "选择 pass 前，可查看类别、helper 预览、服务区域和基础信任信息。",
    unlock: "Pass 解锁",
    actions: ["给 helpers 发消息", "请求 quotes", "预订服务"],
    plans: [
      {
        name: "日通行证",
        note: "适合一次任务、紧急帮助或试用 SwapSpot。",
        features: ["当天可联系 helpers", "请求 quotes", "准备好后预订"],
        cta: "获取日通行证",
      },
      {
        name: "Client Pro",
        note: "适合家庭、租房、照护或小生意的常规需求。",
        best: "最划算",
        features: ["月度访问", "随时发消息和请求 quotes", "使用超过 5 天更划算"],
        cta: "开始 Pro",
      },
    ],
  },
  fr: {
    eyebrow: "Tarifs clients",
    title: "Parcourez gratuitement. Utilisez un pass pour agir.",
    body:
      "Les clients peuvent explorer les catégories et comparer les helpers sans payer. Un pass est nécessaire pour écrire, demander un quote ou réserver. Le paiement du travail lui-même se règle directement avec le helper.",
    freeTitle: "Navigation gratuite",
    freeBody: "Voyez les catégories, aperçus de helpers, zones de service et signaux de confiance avant de choisir un pass.",
    unlock: "Un pass débloque",
    actions: ["Messages aux helpers", "Demandes de quotes", "Réservations"],
    plans: [
      {
        name: "Pass journée",
        note: "Pour une tâche, une urgence ou tester SwapSpot.",
        features: ["Écrire aux helpers pour la journée", "Demander des quotes", "Réserver quand tout est prêt"],
        cta: "Obtenir le pass journée",
      },
      {
        name: "Client Pro",
        note: "Pour les besoins réguliers maison, famille, location ou business.",
        best: "Meilleure valeur",
        features: ["Accès mensuel", "Messages et quotes à tout moment", "Plus rentable après 5 jours actifs"],
        cta: "Démarrer Pro",
      },
    ],
  },
  ru: {
    eyebrow: "Оплата для клиентов",
    title: "Просмотр бесплатный. Платите, только когда готовы связаться.",
    body:
      "Смотрите категории и сравнивайте исполнителей бесплатно. Платный доступ нужен только для переписки, запроса стоимости и бронирования. Оплату самой работы вы согласуете напрямую с исполнителем.",
    freeTitle: "Бесплатный просмотр",
    freeBody: "До оплаты можно смотреть категории, профили исполнителей, районы работы, отзывы и цены.",
    unlock: "Платный доступ открывает",
    actions: ["Переписку с исполнителями", "Запрос стоимости", "Бронирование услуг"],
    plans: [
      {
        name: "Доступ на день",
        note: "Для одной задачи, срочной помощи или знакомства со SwapSpot.",
        features: ["Пишите исполнителям в течение дня", "Запрашивайте стоимость", "Бронируйте, когда готовы"],
        cta: "Получить доступ",
      },
      {
        name: "Client Pro",
        note: "Для регулярных задач дома, семьи, аренды или бизнеса.",
        best: "Лучшая цена",
        features: ["Доступ на месяц", "Переписка и запросы стоимости без ограничений", "Выгодно уже после 5 активных дней"],
        cta: "Подключить Pro",
      },
    ],
  },
  vi: {
    eyebrow: "Bảng giá cho khách hàng",
    title: "Xem miễn phí. Dùng pass khi bạn sẵn sàng hành động.",
    body: "Khách hàng có thể xem danh mục và so sánh người trợ giúp miễn phí. Bạn cần pass để nhắn tin, yêu cầu báo giá hoặc đặt lịch. Bạn thỏa thuận việc thanh toán cho công việc trực tiếp với người trợ giúp.",
    freeTitle: "Xem miễn phí",
    freeBody: "Xem danh mục, hồ sơ người trợ giúp, khu vực phục vụ và thông tin tin cậy cơ bản trước khi chọn pass.",
    unlock: "Pass mở khóa",
    actions: ["Nhắn tin cho người trợ giúp", "Yêu cầu báo giá", "Đặt công việc"],
    plans: [
      { name: "Pass một ngày", note: "Phù hợp cho một công việc, nhu cầu gấp hoặc dùng thử SwapSpot.", features: ["Nhắn tin trong ngày", "Yêu cầu báo giá", "Đặt lịch khi sẵn sàng"], cta: "Mua pass một ngày" },
      { name: "Client Pro", note: "Phù hợp cho nhu cầu thường xuyên của gia đình, nhà cho thuê hoặc doanh nghiệp.", best: "Giá trị tốt nhất", features: ["Truy cập hàng tháng", "Nhắn tin và yêu cầu báo giá bất cứ lúc nào", "Tiết kiệm hơn sau 5 ngày sử dụng"], cta: "Bắt đầu Pro" },
    ],
  },
  th: {
    eyebrow: "ราคาสำหรับลูกค้า",
    title: "ดูได้ฟรี ใช้ pass เมื่อคุณพร้อมดำเนินการ",
    body: "ลูกค้าดูหมวดหมู่และเปรียบเทียบผู้ช่วยได้ฟรี ต้องมี pass เพื่อส่งข้อความ ขอใบเสนอราคา หรือจอง ส่วนค่างานให้ตกลงการชำระเงินกับผู้ช่วยโดยตรง",
    freeTitle: "ดูได้ฟรี",
    freeBody: "ดูหมวดหมู่ โปรไฟล์ผู้ช่วย พื้นที่ให้บริการ และข้อมูลความน่าเชื่อถือก่อนเลือก pass",
    unlock: "Pass ช่วยให้คุณ",
    actions: ["ส่งข้อความหาผู้ช่วย", "ขอใบเสนอราคา", "จองงาน"],
    plans: [
      { name: "Pass หนึ่งวัน", note: "เหมาะสำหรับงานเดียว งานเร่งด่วน หรือทดลองใช้ SwapSpot", features: ["ส่งข้อความได้ตลอดวัน", "ขอใบเสนอราคา", "จองเมื่อคุณพร้อม"], cta: "รับ pass หนึ่งวัน" },
      { name: "Client Pro", note: "เหมาะสำหรับความต้องการประจำของบ้าน ครอบครัว ที่เช่า หรือธุรกิจ", best: "คุ้มค่าที่สุด", features: ["ใช้งานรายเดือน", "ส่งข้อความและขอราคาได้ทุกเมื่อ", "คุ้มขึ้นหลังใช้งาน 5 วัน"], cta: "เริ่ม Pro" },
    ],
  },
  ar: {
    eyebrow: "أسعار العملاء",
    title: "تصفح مجانًا. استخدم اشتراكًا عندما تكون مستعدًا.",
    body: "يمكن للعملاء استكشاف الفئات ومقارنة مقدمي الخدمة دون دفع. تحتاج إلى اشتراك للمراسلة أو طلب عرض سعر أو حجز مقدم خدمة. أما أجر العمل نفسه فيتم الاتفاق على دفعه مباشرة مع مقدم الخدمة.",
    freeTitle: "تصفح مجاني",
    freeBody: "اطّلع على الفئات ومعاينات مقدمي الخدمة ومناطق الخدمة ومؤشرات الثقة الأساسية قبل اختيار اشتراك.",
    unlock: "الاشتراك يتيح لك",
    actions: ["مراسلة مقدمي الخدمة", "طلب عروض الأسعار", "حجز الأعمال"],
    plans: [
      {
        name: "اشتراك اليوم",
        note: "مناسب لمهمة واحدة أو مساعدة عاجلة أو لتجربة SwapSpot.",
        features: ["راسل مقدمي الخدمة طوال اليوم", "اطلب عروض الأسعار", "احجز عندما تكون مستعدًا"],
        cta: "احصل على اشتراك اليوم",
      },
      {
        name: "Client Pro",
        note: "مناسب للاحتياجات المتكررة للمنزل أو العائلة أو الإيجار أو العمل.",
        best: "أفضل قيمة",
        features: ["وصول شهري", "راسل واطلب عروض الأسعار في أي وقت", "أوفر بعد 5 أيام استخدام"],
        cta: "ابدأ Pro",
      },
    ],
  },
  pt: {
    eyebrow: "Preços para clientes",
    title: "Navegue grátis. Use um passe quando estiver pronto.",
    body: "Os clientes podem ver categorias e comparar profissionais sem pagar. É preciso um passe para enviar mensagens, pedir orçamento ou reservar. O pagamento do serviço em si é combinado diretamente com o profissional.",
    freeTitle: "Navegação gratuita",
    freeBody: "Veja categorias, prévias de profissionais, áreas de atendimento e sinais básicos de confiança antes de escolher um passe.",
    unlock: "Um passe libera",
    actions: ["Mensagens para profissionais", "Pedidos de orçamento", "Reservas de serviços"],
    plans: [
      {
        name: "Passe diário",
        note: "Ideal para uma tarefa, ajuda urgente ou para experimentar o SwapSpot.",
        features: ["Converse com profissionais durante o dia", "Peça orçamentos", "Reserve quando estiver pronto"],
        cta: "Comprar passe diário",
      },
      {
        name: "Client Pro",
        note: "Ideal para necessidades frequentes de casa, família, aluguel ou negócio.",
        best: "Melhor custo-benefício",
        features: ["Acesso mensal", "Mensagens e orçamentos a qualquer hora", "Vale mais a pena após 5 dias de uso"],
        cta: "Começar Pro",
      },
    ],
  },
  ht: {
    eyebrow: "Pri pou kliyan",
    title: "Gade gratis. Sèvi ak yon pas lè w pare.",
    body: "Kliyan ka gade kategori epi konpare moun ki bay sèvis san yo pa peye. Ou bezwen yon pas pou ekri, mande yon pri oswa rezève. Peman pou travay la menm, ou regle l dirèkteman ak moun ki bay sèvis la.",
    freeTitle: "Gade gratis",
    freeBody: "Gade kategori, apèsi pwofil, zòn sèvis ak siy konfyans debaz anvan ou chwazi yon pas.",
    unlock: "Yon pas louvri",
    actions: ["Ekri moun ki bay sèvis", "Mande pri", "Rezève travay"],
    plans: [
      {
        name: "Pas pou yon jou",
        note: "Bon pou yon sèl travay, yon ijans oswa pou eseye SwapSpot.",
        features: ["Ekri moun yo pandan jounen an", "Mande pri", "Rezève lè w pare"],
        cta: "Pran pas jounen an",
      },
      {
        name: "Client Pro",
        note: "Bon pou bezwen regilye lakay, fanmi, lokasyon oswa biznis.",
        best: "Pi bon valè",
        features: ["Aksè chak mwa", "Ekri epi mande pri nenpòt lè", "Pi avantaje apre 5 jou itilizasyon"],
        cta: "Kòmanse Pro",
      },
    ],
  },
  de: {
    eyebrow: "Preise für Kunden",
    title: "Kostenlos stöbern. Einen Pass nutzen, wenn Sie loslegen möchten.",
    body: "Kunden können Kategorien ansehen und Helfer vergleichen, ohne zu bezahlen. Für Nachrichten, Angebotsanfragen oder Buchungen braucht es einen Pass. Die Bezahlung der Arbeit selbst vereinbaren Sie direkt mit dem Helfer.",
    freeTitle: "Kostenlos stöbern",
    freeBody: "Sehen Sie Kategorien, Helfervorschauen, Einsatzgebiete und grundlegende Vertrauensmerkmale, bevor Sie einen Pass wählen.",
    unlock: "Ein Pass schaltet frei",
    actions: ["Nachrichten an Helfer", "Angebotsanfragen", "Buchungen"],
    plans: [
      {
        name: "Tagespass",
        note: "Ideal für eine Aufgabe, dringende Hilfe oder zum Ausprobieren von SwapSpot.",
        features: ["Einen Tag lang Helfern schreiben", "Angebote anfragen", "Buchen, wenn Sie bereit sind"],
        cta: "Tagespass holen",
      },
      {
        name: "Client Pro",
        note: "Ideal für regelmäßigen Bedarf in Haushalt, Familie, Vermietung oder Geschäft.",
        best: "Bester Wert",
        features: ["Monatlicher Zugang", "Jederzeit schreiben und Angebote anfragen", "Lohnt sich ab 5 aktiven Tagen"],
        cta: "Pro starten",
      },
    ],
  },
  fil: {
    eyebrow: "Presyo para sa kliyente",
    title: "Mag-browse nang libre. Gumamit ng pass kapag handa ka na.",
    body: "Puwedeng tumingin ng mga kategorya at maghambing ng mga helper ang kliyente nang walang bayad. Kailangan ng pass para mag-message, humingi ng quote o mag-book. Ang bayad para sa mismong trabaho ay direktang pinagkakasunduan ninyo ng helper.",
    freeTitle: "Libreng pag-browse",
    freeBody: "Tingnan ang mga kategorya, preview ng helper, service area at mga pangunahing palatandaan ng tiwala bago pumili ng pass.",
    unlock: "Binubuksan ng pass ang",
    actions: ["Pag-message sa mga helper", "Paghingi ng quote", "Pag-book ng trabaho"],
    plans: [
      {
        name: "Pass para sa isang araw",
        note: "Para sa isang gawain, agarang tulong o pagsubok sa SwapSpot.",
        features: ["Mag-message sa mga helper buong araw", "Humingi ng quote", "Mag-book kapag handa ka na"],
        cta: "Kunin ang pass para sa isang araw",
      },
      {
        name: "Client Pro",
        note: "Para sa regular na pangangailangan ng bahay, pamilya, paupahan o negosyo.",
        best: "Pinakasulit",
        features: ["Buwanang access", "Mag-message at humingi ng quote anumang oras", "Mas sulit pagkalipas ng 5 aktibong araw"],
        cta: "Simulan ang Pro",
      },
    ],
  },
  hi: {
    eyebrow: "ग्राहकों के लिए कीमतें",
    title: "मुफ़्त में देखें। तैयार होने पर पास इस्तेमाल करें।",
    body: "ग्राहक बिना भुगतान के श्रेणियां देख सकते हैं और सेवा प्रदाताओं की तुलना कर सकते हैं। मैसेज, कोटेशन या बुकिंग के लिए पास चाहिए। काम का भुगतान आप सीधे सेवा प्रदाता के साथ तय करते हैं।",
    freeTitle: "मुफ़्त ब्राउज़िंग",
    freeBody: "पास चुनने से पहले श्रेणियां, सेवा प्रदाताओं की झलक, सेवा क्षेत्र और भरोसे के बुनियादी संकेत देखें।",
    unlock: "पास से मिलता है",
    actions: ["सेवा प्रदाताओं को मैसेज", "कोटेशन मांगना", "काम बुक करना"],
    plans: [
      {
        name: "डे पास",
        note: "एक काम, तुरंत मदद या SwapSpot आज़माने के लिए सबसे अच्छा।",
        features: ["पूरे दिन सेवा प्रदाताओं को मैसेज करें", "कोटेशन मांगें", "तैयार होने पर बुक करें"],
        cta: "डे पास लें",
      },
      {
        name: "Client Pro",
        note: "घर, परिवार, किराये या व्यवसाय की नियमित ज़रूरतों के लिए सबसे अच्छा।",
        best: "सबसे किफ़ायती",
        features: ["मासिक एक्सेस", "कभी भी मैसेज और कोटेशन", "5 सक्रिय दिनों के बाद ज़्यादा फ़ायदेमंद"],
        cta: "Pro शुरू करें",
      },
    ],
  },
  bn: {
    eyebrow: "গ্রাহকদের মূল্য",
    title: "বিনামূল্যে দেখুন। প্রস্তুত হলে পাস ব্যবহার করুন।",
    body: "গ্রাহকরা কোনো খরচ ছাড়াই বিভাগ দেখতে ও সেবাদাতাদের তুলনা করতে পারেন। মেসেজ, কোটেশন বা বুকিংয়ের জন্য পাস লাগে। কাজের টাকা পরিশোধের বিষয়টি আপনি সরাসরি সেবাদাতার সাথে ঠিক করবেন।",
    freeTitle: "বিনামূল্যে ব্রাউজিং",
    freeBody: "পাস বেছে নেওয়ার আগে বিভাগ, সেবাদাতার প্রিভিউ, সেবা এলাকা ও আস্থার মৌলিক তথ্য দেখুন।",
    unlock: "পাস দিয়ে পাবেন",
    actions: ["সেবাদাতাদের মেসেজ", "কোটেশন চাওয়া", "কাজ বুক করা"],
    plans: [
      {
        name: "ডে পাস",
        note: "একটি কাজ, জরুরি সাহায্য বা SwapSpot চেষ্টা করার জন্য সেরা।",
        features: ["সারা দিন সেবাদাতাদের মেসেজ করুন", "কোটেশন চান", "প্রস্তুত হলে বুক করুন"],
        cta: "ডে পাস নিন",
      },
      {
        name: "Client Pro",
        note: "বাড়ি, পরিবার, ভাড়া বা ব্যবসার নিয়মিত প্রয়োজনের জন্য সেরা।",
        best: "সেরা মূল্য",
        features: ["মাসিক অ্যাক্সেস", "যেকোনো সময় মেসেজ ও কোটেশন", "৫ দিন সক্রিয় ব্যবহারের পর আরও সাশ্রয়ী"],
        cta: "Pro শুরু করুন",
      },
    ],
  },
  te: {
    eyebrow: "క్లయింట్ ధరలు",
    title: "ఉచితంగా చూడండి. సిద్ధమైనప్పుడు పాస్ ఉపయోగించండి.",
    body: "క్లయింట్లు డబ్బు చెల్లించకుండానే వర్గాలను చూసి సేవా ప్రదాతలను పోల్చవచ్చు. మెసేజ్, కోట్ లేదా బుకింగ్ కోసం పాస్ అవసరం. పనికి చెల్లింపును మీరు నేరుగా సేవా ప్రదాతతో ఏర్పాటు చేసుకుంటారు.",
    freeTitle: "ఉచిత బ్రౌజింగ్",
    freeBody: "పాస్ ఎంచుకునే ముందు వర్గాలు, సేవా ప్రదాతల ప్రివ్యూలు, సేవా ప్రాంతాలు మరియు ప్రాథమిక నమ్మక సూచనలు చూడండి.",
    unlock: "పాస్‌తో లభించేవి",
    actions: ["సేవా ప్రదాతలకు మెసేజ్", "కోట్ అడగడం", "పనులు బుక్ చేయడం"],
    plans: [
      {
        name: "డే పాస్",
        note: "ఒక పని, అత్యవసర సహాయం లేదా SwapSpotను ప్రయత్నించడానికి ఉత్తమం.",
        features: ["రోజంతా సేవా ప్రదాతలకు మెసేజ్ చేయండి", "కోట్ అడగండి", "సిద్ధమైనప్పుడు బుక్ చేయండి"],
        cta: "డే పాస్ పొందండి",
      },
      {
        name: "Client Pro",
        note: "ఇల్లు, కుటుంబం, అద్దె లేదా వ్యాపార అవసరాలకు క్రమంగా ఉపయోగించడానికి ఉత్తమం.",
        best: "ఉత్తమ విలువ",
        features: ["నెలవారీ యాక్సెస్", "ఎప్పుడైనా మెసేజ్ మరియు కోట్", "5 క్రియాశీల రోజుల తర్వాత మరింత లాభం"],
        cta: "Pro ప్రారంభించండి",
      },
    ],
  },
  ta: {
    eyebrow: "வாடிக்கையாளர் விலைகள்",
    title: "இலவசமாகப் பாருங்கள். தயாரானதும் பாஸ் பயன்படுத்துங்கள்.",
    body: "வாடிக்கையாளர்கள் கட்டணமின்றி வகைகளைப் பார்த்து சேவை வழங்குநர்களை ஒப்பிடலாம். செய்தி, விலைப்புள்ளி அல்லது முன்பதிவுக்கு பாஸ் தேவை. வேலைக்கான கட்டணத்தை சேவை வழங்குநருடன் நேரடியாக ஏற்பாடு செய்துகொள்வீர்கள்.",
    freeTitle: "இலவச உலாவல்",
    freeBody: "பாஸைத் தேர்ந்தெடுக்கும் முன் வகைகள், சேவை வழங்குநர் முன்னோட்டங்கள், சேவைப் பகுதிகள் மற்றும் அடிப்படை நம்பிக்கை குறிப்புகளைப் பாருங்கள்.",
    unlock: "பாஸ் மூலம் கிடைப்பவை",
    actions: ["சேவை வழங்குநர்களுக்குச் செய்தி", "விலைப்புள்ளி கோருதல்", "பணிகளை முன்பதிவு செய்தல்"],
    plans: [
      {
        name: "நாள் பாஸ்",
        note: "ஒரு பணி, அவசர உதவி அல்லது SwapSpot-ஐ முயற்சிக்க சிறந்தது.",
        features: ["நாள் முழுவதும் சேவை வழங்குநர்களுக்குச் செய்தி அனுப்புங்கள்", "விலைப்புள்ளி கேளுங்கள்", "தயாரானதும் முன்பதிவு செய்யுங்கள்"],
        cta: "நாள் பாஸ் பெறுங்கள்",
      },
      {
        name: "Client Pro",
        note: "வீடு, குடும்பம், வாடகை அல்லது வணிகத்தின் வழக்கமான தேவைகளுக்குச் சிறந்தது.",
        best: "சிறந்த மதிப்பு",
        features: ["மாதாந்திர அணுகல்", "எப்போது வேண்டுமானாலும் செய்தி மற்றும் விலைப்புள்ளி", "5 செயலில் உள்ள நாட்களுக்குப் பிறகு அதிக லாபம்"],
        cta: "Pro தொடங்குங்கள்",
      },
    ],
  },
};

export type PassPriceCopy = { seeStore: string; referenceNote: string; footnote: string };

// Contract §4.2: a reference price only where it is confirmed in both stores (lib/storePrices.ts),
// otherwise the neutral store text. Every reference price says that the store shows the final price.
export const passPriceCopy: Record<ShippedLocale, PassPriceCopy> = {
  en: {
    seeStore: "See the current price in the App Store or Google Play",
    referenceNote: "Reference price. The App Store or Google Play shows the final price.",
    footnote: "Final local price and taxes are shown by the App Store or Google Play before purchase.",
  },
  es: {
    seeStore: "Consulta el precio actual en App Store o Google Play",
    referenceNote: "Precio de referencia. App Store o Google Play muestran el precio final.",
    footnote: "El precio local final y los impuestos aparecen en App Store o Google Play antes de la compra.",
  },
  zh: {
    seeStore: "请在 App Store 或 Google Play 查看当前价格",
    referenceNote: "参考价格。最终价格以 App Store 或 Google Play 显示为准。",
    footnote: "购买前，App Store 或 Google Play 会显示最终本地价格和税费。",
  },
  fr: {
    seeStore: "Consultez le prix actuel sur l'App Store ou Google Play",
    referenceNote: "Prix indicatif. L'App Store ou Google Play affiche le prix final.",
    footnote: "Le prix local final et les taxes sont affichés par l'App Store ou Google Play avant l'achat.",
  },
  ru: {
    seeStore: "Актуальная цена — в App Store или Google Play",
    referenceNote: "Ориентировочная цена. Итоговую цену покажет App Store или Google Play.",
    footnote: "Итоговую цену в вашей стране и налоги покажет App Store или Google Play перед покупкой.",
  },
  ar: {
    seeStore: "اطّلع على السعر الحالي في App Store أو Google Play",
    referenceNote: "سعر استرشادي. يعرض App Store أو Google Play السعر النهائي.",
    footnote: "يعرض App Store أو Google Play السعر المحلي النهائي والضرائب قبل الشراء.",
  },
  pt: {
    seeStore: "Veja o preço atual na App Store ou no Google Play",
    referenceNote: "Preço de referência. A App Store ou o Google Play mostram o preço final.",
    footnote: "O preço local final e os impostos aparecem na App Store ou no Google Play antes da compra.",
  },
  ht: {
    seeStore: "Gade pri aktyèl la nan App Store oswa Google Play",
    referenceNote: "Pri referans. App Store oswa Google Play ap montre pri final la.",
    footnote: "App Store oswa Google Play ap montre pri lokal final la ak taks yo anvan ou achte.",
  },
  de: {
    seeStore: "Den aktuellen Preis finden Sie im App Store oder bei Google Play",
    referenceNote: "Richtpreis. Den endgültigen Preis zeigt der App Store oder Google Play.",
    footnote: "Der endgültige lokale Preis und Steuern werden vor dem Kauf im App Store oder bei Google Play angezeigt.",
  },
  fil: {
    seeStore: "Tingnan ang kasalukuyang presyo sa App Store o Google Play",
    referenceNote: "Reference na presyo. Ang App Store o Google Play ang magpapakita ng huling presyo.",
    footnote: "Ipinapakita ng App Store o Google Play ang huling lokal na presyo at buwis bago bumili.",
  },
  hi: {
    seeStore: "मौजूदा कीमत App Store या Google Play में देखें",
    referenceNote: "संदर्भ कीमत। अंतिम कीमत App Store या Google Play दिखाता है।",
    footnote: "खरीद से पहले App Store या Google Play अंतिम स्थानीय कीमत और कर दिखाता है।",
  },
  bn: {
    seeStore: "বর্তমান মূল্য App Store বা Google Play-তে দেখুন",
    referenceNote: "রেফারেন্স মূল্য। চূড়ান্ত মূল্য App Store বা Google Play দেখাবে।",
    footnote: "কেনার আগে App Store বা Google Play চূড়ান্ত স্থানীয় মূল্য ও কর দেখায়।",
  },
  te: {
    seeStore: "ప్రస్తుత ధరను App Store లేదా Google Playలో చూడండి",
    referenceNote: "సూచన ధర. తుది ధరను App Store లేదా Google Play చూపిస్తుంది.",
    footnote: "కొనుగోలుకు ముందు App Store లేదా Google Play తుది స్థానిక ధర మరియు పన్నులను చూపిస్తుంది.",
  },
  ta: {
    seeStore: "தற்போதைய விலையை App Store அல்லது Google Play-இல் பார்க்கவும்",
    referenceNote: "குறிப்பு விலை. இறுதி விலையை App Store அல்லது Google Play காட்டும்.",
    footnote: "வாங்குவதற்கு முன் App Store அல்லது Google Play இறுதி உள்ளூர் விலையையும் வரிகளையும் காட்டும்.",
  },
  vi: {
    seeStore: "Xem giá hiện tại trên App Store hoặc Google Play",
    referenceNote: "Giá tham khảo. App Store hoặc Google Play sẽ hiển thị giá cuối cùng.",
    footnote: "App Store hoặc Google Play hiển thị giá địa phương cuối cùng và thuế trước khi mua.",
  },
  th: {
    seeStore: "ดูราคาปัจจุบันได้ใน App Store หรือ Google Play",
    referenceNote: "ราคาอ้างอิง ราคาสุดท้ายจะแสดงใน App Store หรือ Google Play",
    footnote: "App Store หรือ Google Play จะแสดงราคาท้องถิ่นสุดท้ายและภาษีก่อนการซื้อ",
  },
};

export function pricingCopy(locale: Locale): ClientPricingCopy {
  return (clientPricingCopy as Partial<Record<string, ClientPricingCopy>>)[locale] ?? extraLocaleTables(locale)?.pricing ?? clientPricingCopy.en;
}

export function passPriceCopyFor(locale: Locale): PassPriceCopy {
  return (passPriceCopy as Partial<Record<string, PassPriceCopy>>)[locale] ?? extraLocaleTables(locale)?.passPrice ?? passPriceCopy.en;
}
