export const locales = ["en", "es", "zh", "fr", "ru"] as const;

export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  zh: "中文",
  fr: "Français",
  ru: "Русский",
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

export const dictionaries = {
  en: {
    metaTitle: "SwapSpot - Find Trusted Local Help Near You",
    metaDescription:
      "Book trusted local helpers for cleaning, repairs, beauty, lawn care, moving, pet care, senior care, tutoring, and more.",
    nav: {
      how: "How it works",
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
        "Book cleaning, repairs, beauty, lawn care, moving help, pet care and more — all from one neighborhood marketplace.",
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
        "From “I need this done” to “it's booked” — without the phone tag, guesswork, or sketchy quotes.",
    },
    steps: [
      ["Search nearby helpers", "See trusted local helpers on a live map, sorted by distance and rating."],
      ["Compare services & prices", "Browse profiles, services, and transparent pricing before you commit."],
      ["Book, chat & pay safely", "Message, get a quote, and pay securely — all inside the app."],
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
      ["Set your prices & availability", "You control your rates, radius, and schedule."],
      ["Receive bookings & send quotes", "Get requests nearby and reply with custom quotes."],
      ["Build reviews & repeat clients", "Earn ratings that turn first jobs into regulars."],
    ],
    categories: {
      eyebrow: "Categories",
      title: "Whatever the job, there's a helper",
      body: "Ten categories at launch, with more added as your neighborhood grows.",
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
      ["In-app chat", "Keep all conversations and quotes in one place."],
      ["Report & block", "Flag or block any user, anytime, no questions asked."],
      ["Account deletion", "Delete your account and data whenever you choose."],
      ["Location privacy", "Helpers control how their location is shown."],
    ],
    waitlist: {
      title: "Ready to find help around the corner?",
      body: "Join the waitlist and be first in line when SwapSpot opens in your area.",
      email: "Email address",
      placeholder: "you@email.com",
      join: "Join the Waitlist",
      thanks: "Thanks — you're on the list!",
      storeCaption: "Be first when we launch — on iOS or Android",
      comingSoon: "Coming soon to",
      noSpam: "No spam · Launching across the US in 2026",
    },
    footer: {
      tagline: "The neighborhood marketplace for trusted local help. Made for communities across the US.",
      product: "Product",
      company: "Company",
      about: "About",
      contact: "Contact",
      privacy: "Privacy",
      rights: "© 2026 SwapSpot. All rights reserved.",
      bottom: "Find trusted local help near you.",
    },
  },
  es: {
    metaTitle: "SwapSpot - Encuentra ayuda local de confianza cerca de ti",
    metaDescription:
      "Reserva helpers locales de confianza para limpieza, reparaciones, belleza, jardín, mudanzas, cuidado de mascotas, cuidado de mayores, tutorías y más.",
    nav: { how: "Cómo funciona", categories: "Categorías", helpers: "Para Helpers", trust: "Confianza y seguridad", getApp: "Obtener la app" },
    hero: {
      badge: "Lanzando ahora en tu vecindario",
      before: "Encuentra",
      highlight: "ayuda local confiable",
      after: "cerca de ti",
      body: "Reserva limpieza, reparaciones, belleza, jardín, mudanzas, cuidado de mascotas y más — todo desde un marketplace de tu vecindario.",
      findHelp: "Buscar ayuda",
      becomeHelper: "Ser Helper",
      rating: "de 2,300+ vecinos · 1,200 helpers cerca",
      review: "Reservé un handyman de mi zona en 10 minutos.",
      reviewer: "David · a 1 mi",
      bookingConfirmed: "Reserva confirmada",
      bookingMeta: "Jardín · Sáb 9:00 AM",
    },
    how: { eyebrow: "Cómo funciona", title: "Ayuda en tres toques", body: "De “necesito hacerlo” a “ya está reservado” — sin llamadas, dudas ni cotizaciones raras." },
    steps: [
      ["Busca helpers cercanos", "Ve helpers locales confiables en un mapa, ordenados por distancia y rating."],
      ["Compara servicios y precios", "Revisa perfiles, servicios y precios claros antes de reservar."],
      ["Reserva, chatea y paga seguro", "Envía mensajes, recibe un quote y paga de forma segura en la app."],
    ],
    helpers: { eyebrow: "Para Helpers", title: "Convierte tus habilidades en ingresos locales", body: "Configura tu perfil una vez y empieza a recibir reservas de vecinos que necesitan lo que haces.", start: "Empezar como Helper", earnings: "Ganancias esta semana", bookings: "3 reservas nuevas", quotes: "2 quotes esperando respuesta" },
    perks: [
      ["Crea tu perfil de servicios", "Publica tus habilidades, fotos y área de trabajo en minutos."],
      ["Define precios y disponibilidad", "Tú controlas tarifas, radio y horario."],
      ["Recibe reservas y envía quotes", "Recibe solicitudes cercanas y responde con quotes personalizados."],
      ["Construye reseñas y clientes", "Gana ratings que convierten trabajos en clientes recurrentes."],
    ],
    categories: { eyebrow: "Categorías", title: "Sea cual sea el trabajo, hay un helper", body: "Diez categorías al lanzamiento, con más a medida que crece tu vecindario.", nearby: "cerca", names: { cleaning: "Limpieza", handyman: "Handyman", plumbing: "Plomería", electrical: "Electricidad", "lawn-garden": "Jardín", "nails-beauty": "Uñas y belleza", moving: "Mudanzas", "pet-care": "Mascotas", "senior-care": "Cuidado de mayores", tutoring: "Tutorías" } },
    trust: { eyebrow: "Confianza y seguridad", title: "Diseñado para sentirse seguro en ambos lados", body: "Reseñas reales, chat privado y controles para que cada vecino maneje sus datos." },
    trustItems: [
      ["Reseñas verificadas", "Ratings reales de vecinos reales después de cada trabajo."],
      ["Chat en la app", "Conversaciones y quotes en un solo lugar."],
      ["Reportar y bloquear", "Reporta o bloquea a cualquier usuario cuando quieras."],
      ["Eliminar cuenta", "Elimina tu cuenta y datos cuando lo decidas."],
      ["Privacidad de ubicación", "Los helpers controlan cómo se muestra su ubicación."],
    ],
    waitlist: { title: "¿Listo para encontrar ayuda a la vuelta?", body: "Únete a la lista y sé de los primeros cuando SwapSpot llegue a tu área.", email: "Correo electrónico", placeholder: "tu@email.com", join: "Unirme a la lista", thanks: "Gracias — estás en la lista.", storeCaption: "Sé el primero cuando lancemos — en iOS o Android", comingSoon: "Próximamente en", noSpam: "Sin spam · Lanzamiento en EE. UU. en 2026" },
    footer: { tagline: "El marketplace del vecindario para ayuda local confiable. Hecho para comunidades en EE. UU.", product: "Producto", company: "Compañía", about: "Acerca de", contact: "Contacto", privacy: "Privacidad", rights: "© 2026 SwapSpot. Todos los derechos reservados.", bottom: "Encuentra ayuda local de confianza cerca de ti." },
  },
  zh: {
    metaTitle: "SwapSpot - 寻找附近可信赖的本地帮手",
    metaDescription: "预约可信赖的本地帮手，服务包括清洁、维修、美容、庭院、搬家、宠物护理、老人护理、辅导等。",
    nav: { how: "如何使用", categories: "服务类别", helpers: "成为 Helper", trust: "信任与安全", getApp: "获取应用" },
    hero: { badge: "正在你的社区上线", before: "寻找", highlight: "可信赖的本地帮手", after: "就在附近", body: "预约清洁、维修、美容、庭院、搬家、宠物护理等服务 — 全部都在一个社区 marketplace 中完成。", findHelp: "寻找帮助", becomeHelper: "成为 Helper", rating: "来自 2,300+ 邻居 · 附近 1,200 位 helpers", review: "10 分钟就预约到了附近的维修帮手。", reviewer: "David · 1 英里", bookingConfirmed: "预约已确认", bookingMeta: "庭院护理 · 周六 9:00 AM" },
    how: { eyebrow: "如何使用", title: "三步即可预约帮助", body: "从“我需要完成这件事”到“已预约” — 无需反复打电话、猜价格或冒险交易。" },
    steps: [["搜索附近 helpers", "在实时地图上查看可信赖的本地 helpers。"], ["比较服务和价格", "预约前查看资料、服务和透明价格。"], ["预约、聊天并安全付款", "在应用内聊天、获取 quote 并安全付款。"]],
    helpers: { eyebrow: "给 Helpers", title: "把技能变成本地收入", body: "一次设置资料，就能被附近需要你服务的邻居预约。", start: "开始成为 Helper", earnings: "本周收入", bookings: "3 个新预约", quotes: "2 个 quote 等待回复" },
    perks: [["创建服务资料", "几分钟内展示技能、照片和服务区域。"], ["设置价格和时间", "你控制价格、半径和日程。"], ["接收预约并发送 quotes", "收到附近请求并发送自定义 quotes。"], ["积累评价和回头客", "用真实评价建立长期客户。"]],
    categories: { eyebrow: "服务类别", title: "各种需求，都能找到 helper", body: "上线时提供十个类别，随着社区成长继续增加。", nearby: "附近", names: { cleaning: "清洁", handyman: "维修帮手", plumbing: "管道", electrical: "电工", "lawn-garden": "庭院", "nails-beauty": "美甲美容", moving: "搬家", "pet-care": "宠物护理", "senior-care": "老人护理", tutoring: "辅导" } },
    trust: { eyebrow: "信任与安全", title: "让双方都安心的设计", body: "真实评价、私密聊天和数据控制，让每位用户都更安心。" },
    trustItems: [["已验证评价", "每次服务后来自真实邻居的评价。"], ["应用内聊天", "对话和 quotes 集中在一个地方。"], ["举报和屏蔽", "随时举报或屏蔽用户。"], ["删除账户", "你可以随时删除账户和数据。"], ["位置隐私", "Helpers 可以控制位置展示方式。"]],
    waitlist: { title: "准备好寻找附近帮助了吗？", body: "加入 waitlist，SwapSpot 到达你的区域时优先体验。", email: "邮箱地址", placeholder: "you@email.com", join: "加入 Waitlist", thanks: "谢谢 — 你已加入列表。", storeCaption: "iOS 和 Android 即将上线", comingSoon: "即将登陆", noSpam: "无垃圾邮件 · 2026 年全美上线" },
    footer: { tagline: "可信赖本地帮助的社区 marketplace，为美国各地社区打造。", product: "产品", company: "公司", about: "关于", contact: "联系", privacy: "隐私", rights: "© 2026 SwapSpot. 保留所有权利。", bottom: "寻找附近可信赖的本地帮手。" },
  },
  fr: {
    metaTitle: "SwapSpot - Trouvez de l’aide locale de confiance près de vous",
    metaDescription: "Réservez des helpers locaux de confiance pour ménage, réparations, beauté, jardin, déménagement, garde d’animaux, aide senior, tutorat et plus.",
    nav: { how: "Comment ça marche", categories: "Catégories", helpers: "Pour Helpers", trust: "Sécurité", getApp: "Obtenir l’app" },
    hero: { badge: "Lancement dans votre quartier", before: "Trouvez", highlight: "de l’aide locale fiable", after: "près de vous", body: "Réservez ménage, réparations, beauté, jardin, déménagement, garde d’animaux et plus — depuis une marketplace de quartier.", findHelp: "Trouver de l’aide", becomeHelper: "Devenir Helper", rating: "par 2 300+ voisins · 1 200 helpers proches", review: "J’ai réservé un handyman du quartier en 10 minutes.", reviewer: "David · à 1 mi", bookingConfirmed: "Réservation confirmée", bookingMeta: "Jardin · Sam 9:00" },
    how: { eyebrow: "Comment ça marche", title: "De l’aide en trois clics", body: "De « j’ai besoin d’aide » à « c’est réservé » — sans appels interminables ni devis douteux." },
    steps: [["Cherchez des helpers proches", "Voyez les helpers locaux fiables sur une carte en direct."], ["Comparez services et prix", "Consultez profils, services et tarifs transparents."], ["Réservez, discutez et payez", "Messagez, recevez un quote et payez en sécurité dans l’app."]],
    helpers: { eyebrow: "Pour Helpers", title: "Transformez vos compétences en revenu local", body: "Créez votre profil et recevez des réservations de voisins qui ont besoin de vous.", start: "Commencer comme Helper", earnings: "Revenus cette semaine", bookings: "3 nouvelles réservations", quotes: "2 quotes en attente" },
    perks: [["Créez votre profil", "Ajoutez vos compétences, photos et zone de travail."], ["Fixez prix et disponibilités", "Vous contrôlez tarifs, rayon et planning."], ["Recevez des réservations", "Répondez aux demandes proches avec des quotes personnalisés."], ["Développez vos avis", "Les notes transforment les missions en clients réguliers."]],
    categories: { eyebrow: "Catégories", title: "Quel que soit le besoin, il y a un helper", body: "Dix catégories au lancement, puis davantage avec la croissance du quartier.", nearby: "proches", names: { cleaning: "Ménage", handyman: "Handyman", plumbing: "Plomberie", electrical: "Électricité", "lawn-garden": "Jardin", "nails-beauty": "Beauté", moving: "Déménagement", "pet-care": "Animaux", "senior-care": "Aide senior", tutoring: "Tutorat" } },
    trust: { eyebrow: "Confiance et sécurité", title: "Conçu pour rassurer les deux côtés", body: "Avis réels, messagerie privée et contrôles pour garder la maîtrise de vos données." },
    trustItems: [["Avis vérifiés", "De vraies notes après chaque mission."], ["Chat intégré", "Conversations et quotes au même endroit."], ["Signaler et bloquer", "Signalez ou bloquez un utilisateur à tout moment."], ["Suppression du compte", "Supprimez votre compte et vos données quand vous voulez."], ["Confidentialité de localisation", "Les helpers contrôlent l’affichage de leur position."]],
    waitlist: { title: "Prêt à trouver de l’aide près de chez vous ?", body: "Rejoignez la waitlist et soyez parmi les premiers lors du lancement.", email: "Adresse email", placeholder: "vous@email.com", join: "Rejoindre la waitlist", thanks: "Merci — vous êtes sur la liste.", storeCaption: "Soyez parmi les premiers sur iOS ou Android", comingSoon: "Bientôt sur", noSpam: "Pas de spam · Lancement aux États-Unis en 2026" },
    footer: { tagline: "La marketplace de quartier pour une aide locale fiable. Créée pour les communautés aux États-Unis.", product: "Produit", company: "Entreprise", about: "À propos", contact: "Contact", privacy: "Confidentialité", rights: "© 2026 SwapSpot. Tous droits réservés.", bottom: "Trouvez de l’aide locale de confiance près de vous." },
  },
  ru: {
    metaTitle: "SwapSpot - Найдите надежную локальную помощь рядом",
    metaDescription: "Бронируйте надежных локальных helpers для уборки, ремонта, красоты, ухода за газоном, переезда, ухода за питомцами, помощи пожилым, репетиторов и другого.",
    nav: { how: "Как работает", categories: "Категории", helpers: "Для Helpers", trust: "Безопасность", getApp: "Получить app" },
    hero: { badge: "Запуск в вашем районе", before: "Найдите", highlight: "надежную локальную помощь", after: "рядом", body: "Бронируйте уборку, ремонт, красоту, газон, помощь с переездом, уход за питомцами и многое другое — в одном neighborhood marketplace.", findHelp: "Найти помощь", becomeHelper: "Стать Helper", rating: "от 2,300+ соседей · 1,200 helpers рядом", review: "Забронировал handyman рядом за 10 минут.", reviewer: "David · 1 миля", bookingConfirmed: "Бронирование подтверждено", bookingMeta: "Газон · Сб 9:00 AM" },
    how: { eyebrow: "Как работает", title: "Помощь в три касания", body: "От «мне нужно это сделать» до «забронировано» — без долгих звонков, догадок и мутных quotes." },
    steps: [["Найдите helpers рядом", "Смотрите надежных локальных helpers на живой карте."], ["Сравните услуги и цены", "Изучайте профили, услуги и прозрачные цены до бронирования."], ["Бронируйте, пишите и платите безопасно", "Чат, quote и оплата — все внутри приложения."]],
    helpers: { eyebrow: "Для Helpers", title: "Превратите навыки в локальный доход", body: "Настройте профиль один раз и получайте заказы от соседей, которым нужны ваши услуги.", start: "Начать как Helper", earnings: "Доход за неделю", bookings: "3 новых бронирования", quotes: "2 quotes ждут ответа" },
    perks: [["Создайте профиль услуг", "Добавьте навыки, фото и рабочую зону за минуты."], ["Настройте цены и график", "Вы контролируете ставки, радиус и расписание."], ["Получайте заказы и отправляйте quotes", "Отвечайте на запросы рядом персональными quotes."], ["Собирайте отзывы и клиентов", "Отзывы превращают разовые заказы в постоянных клиентов."]],
    categories: { eyebrow: "Категории", title: "Для любой задачи найдется helper", body: "Десять категорий на запуске, дальше больше по мере роста района.", nearby: "рядом", names: { cleaning: "Уборка", handyman: "Handyman", plumbing: "Сантехника", electrical: "Электрика", "lawn-garden": "Газон и сад", "nails-beauty": "Красота", moving: "Переезд", "pet-care": "Питомцы", "senior-care": "Помощь пожилым", tutoring: "Репетиторы" } },
    trust: { eyebrow: "Доверие и безопасность", title: "Сделано спокойно для обеих сторон", body: "Реальные отзывы, приватный чат и контроль данных для каждого пользователя." },
    trustItems: [["Проверенные отзывы", "Реальные оценки после каждой работы."], ["Чат в приложении", "Все сообщения и quotes в одном месте."], ["Жалобы и блокировка", "Можно пожаловаться или заблокировать пользователя в любой момент."], ["Удаление аккаунта", "Удаляйте аккаунт и данные, когда захотите."], ["Приватность геолокации", "Helpers контролируют, как показывается их местоположение."]],
    waitlist: { title: "Готовы найти помощь рядом?", body: "Вступайте в waitlist и получите ранний доступ, когда SwapSpot откроется в вашем районе.", email: "Email", placeholder: "you@email.com", join: "Вступить в waitlist", thanks: "Спасибо — вы в списке.", storeCaption: "Будьте первыми на iOS или Android", comingSoon: "Скоро в", noSpam: "Без спама · запуск по США в 2026" },
    footer: { tagline: "Neighborhood marketplace для надежной локальной помощи. Сделано для районов по всей Америке.", product: "Продукт", company: "Компания", about: "О нас", contact: "Контакты", privacy: "Privacy", rights: "© 2026 SwapSpot. Все права защищены.", bottom: "Найдите надежную локальную помощь рядом." },
  },
} as const;

export type Dictionary = (typeof dictionaries)[Locale];
