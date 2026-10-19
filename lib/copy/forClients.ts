// Copy of the home page "For Clients" section (components/ForClients.tsx). Shipped locales
// without their own table keep the copy built from the dictionary; registry languages use their
// locale pack (keys `forClients.*`).
import { extraLocaleTables } from "../extraLocales";
import { getDictionary } from "../i18n";
import type { Locale, ShippedLocale } from "../locales";

export type ForClientsCopy = {
    eyebrow: string;
    title: string;
    body: string;
    cta: string;
    statA: string;
    statB: string;
    statC: string;
    cards: [string, string][];
    panelTitle: string;
    panelMeta: string;
    panelAction: string;
    panelTotal: string;
    panelSecure: string;
  };

export const forClientsCopyTable: Partial<Record<ShippedLocale, ForClientsCopy>> & { en: ForClientsCopy } = {
  en: {
    eyebrow: "For Clients",
    title: "Get the job done without chasing people around",
    body:
      "Open the app, see who is nearby, compare real profiles, message inside SwapSpot, and book when it feels right.",
    cta: "Find local help",
    statA: "Live map",
    statB: "Clear quotes",
    statC: "Safer booking",
    cards: [
      ["Find nearby help", "Search by category, distance, rating, and availability."],
      ["Compare before booking", "See profiles, prices, reviews, photos, and services."],
      ["Chat in one place", "Ask questions, confirm details, and keep quotes organized."],
      ["Book with confidence", "Use reviews, reports, blocks, and account controls when needed."],
    ],
    panelTitle: "Saturday deep clean",
    panelMeta: "Maria R. · 0.8 mi · 4.9 rating",
    panelAction: "Quote ready",
    panelTotal: "$90 total",
    panelSecure: "Secure",
  },
  es: {
    eyebrow: "Para clientes",
    title: "Resuelve el trabajo sin perseguir a nadie",
    body:
      "Abre la app, mira quién está cerca, compara perfiles reales, escribe dentro de SwapSpot y reserva cuando te sientas listo.",
    cta: "Buscar ayuda local",
    statA: "Mapa en vivo",
    statB: "Quotes claros",
    statC: "Reserva segura",
    cards: [
      ["Encuentra ayuda cerca", "Busca por categoría, distancia, rating y disponibilidad."],
      ["Compara antes de reservar", "Mira perfiles, precios, reseñas, fotos y servicios."],
      ["Chatea en un lugar", "Pregunta, confirma detalles y mantén quotes ordenados."],
      ["Reserva con confianza", "Usa reseñas, reportes, bloqueos y controles de cuenta."],
    ],
    panelTitle: "Limpieza profunda sábado",
    panelMeta: "Maria R. · 0.8 mi · rating 4.9",
    panelAction: "Quote listo",
    panelTotal: "$90 total",
    panelSecure: "Seguro",
  },
  zh: {
    eyebrow: "给客户",
    title: "不用反复找人，也能把事情办好",
    body: "打开应用，查看附近 helpers，比较真实资料，在 SwapSpot 内聊天，并在合适的时候预订。",
    cta: "寻找本地帮助",
    statA: "实时地图",
    statB: "清晰 quote",
    statC: "安心预订",
    cards: [
      ["寻找附近帮助", "按类别、距离、评分和可用时间搜索。"],
      ["预订前比较", "查看资料、价格、评价、照片和服务。"],
      ["集中聊天", "提问、确认细节，并管理 quotes。"],
      ["更安心预订", "需要时使用评价、举报、屏蔽和账户控制。"],
    ],
    panelTitle: "周六深度清洁",
    panelMeta: "Maria R. · 0.8 英里 · 4.9 评分",
    panelAction: "Quote 已准备",
    panelTotal: "$90 总计",
    panelSecure: "安全",
  },
  fr: {
    eyebrow: "Pour clients",
    title: "Faites avancer le job sans courir après les gens",
    body:
      "Ouvrez l'app, voyez qui est proche, comparez les profils réels, discutez dans SwapSpot et réservez quand tout est clair.",
    cta: "Trouver de l'aide",
    statA: "Carte en direct",
    statB: "Quotes clairs",
    statC: "Réservation sûre",
    cards: [
      ["Trouvez de l'aide proche", "Cherchez par catégorie, distance, note et disponibilité."],
      ["Comparez avant de réserver", "Voyez profils, prix, avis, photos et services."],
      ["Discutez au même endroit", "Posez vos questions, confirmez les détails et gardez les quotes."],
      ["Réservez avec confiance", "Utilisez avis, signalements, blocages et contrôles de compte."],
    ],
    panelTitle: "Ménage profond samedi",
    panelMeta: "Maria R. · 0.8 mi · note 4.9",
    panelAction: "Quote prêt",
    panelTotal: "$90 total",
    panelSecure: "Sécurisé",
  },
  ru: {
    eyebrow: "Для клиентов",
    title: "Решайте задачи без бесконечного поиска исполнителя",
    body:
      "Откройте приложение, посмотрите, кто рядом, сравните реальные профили, обсудите детали и бронируйте, когда все понятно.",
    cta: "Найти помощь рядом",
    statA: "Карта рядом",
    statB: "Понятные цены",
    statC: "Безопасная бронь",
    cards: [
      ["Найдите помощь рядом", "Ищите по категории, расстоянию, рейтингу и доступности."],
      ["Сравните до брони", "Смотрите профили, цены, отзывы, фото и услуги."],
      ["Общайтесь в одном месте", "Задавайте вопросы, уточняйте детали и храните все расчеты."],
      ["Бронируйте спокойнее", "Используйте отзывы, жалобы, блокировки и контроль аккаунта."],
    ],
    panelTitle: "Глубокая уборка в субботу",
    panelMeta: "Мария Р. · 0,8 мили · рейтинг 4,9",
    panelAction: "Стоимость рассчитана",
    panelTotal: "$90 итого",
    panelSecure: "Защищено",
  },
  vi: {
    eyebrow: "Dành cho khách hàng",
    title: "Hoàn thành công việc mà không phải tìm kiếm mãi",
    body: "Mở ứng dụng, xem ai ở gần, so sánh hồ sơ thật, nhắn tin trong SwapSpot và đặt lịch khi bạn thấy phù hợp.",
    cta: "Tìm trợ giúp gần bạn",
    statA: "Bản đồ trực tiếp",
    statB: "Báo giá rõ ràng",
    statC: "Đặt lịch an toàn hơn",
    cards: [
      ["Tìm trợ giúp gần bạn", "Tìm theo danh mục, khoảng cách, đánh giá và lịch trống."],
      ["So sánh trước khi đặt", "Xem hồ sơ, giá, đánh giá, ảnh và dịch vụ."],
      ["Nhắn tin ở một nơi", "Đặt câu hỏi, xác nhận chi tiết và quản lý báo giá."],
      ["Đặt lịch tự tin hơn", "Sử dụng đánh giá, báo cáo, chặn và kiểm soát tài khoản khi cần."],
    ],
    panelTitle: "Dọn dẹp sâu vào thứ Bảy",
    panelMeta: "Maria R. · 0,8 dặm · đánh giá 4,9",
    panelAction: "Báo giá đã sẵn sàng",
    panelTotal: "Tổng $90",
    panelSecure: "An toàn",
  },
  th: {
    eyebrow: "สำหรับลูกค้า",
    title: "ให้งานเสร็จโดยไม่ต้องตามหาคนให้วุ่นวาย",
    body: "เปิดแอป ดูว่าใครอยู่ใกล้ เปรียบเทียบโปรไฟล์จริง แชตใน SwapSpot และจองเมื่อคุณพร้อม",
    cta: "ค้นหาความช่วยเหลือใกล้คุณ",
    statA: "แผนที่แบบสด",
    statB: "ใบเสนอราคาชัดเจน",
    statC: "จองได้อย่างมั่นใจ",
    cards: [
      ["ค้นหาผู้ช่วยใกล้คุณ", "ค้นหาตามหมวดหมู่ ระยะทาง คะแนน และเวลาว่าง"],
      ["เปรียบเทียบก่อนจอง", "ดูโปรไฟล์ ราคา รีวิว รูปภาพ และบริการ"],
      ["แชตในที่เดียว", "ถามคำถาม ยืนยันรายละเอียด และจัดการใบเสนอราคา"],
      ["จองได้อย่างมั่นใจ", "ใช้รีวิว การรายงาน การบล็อก และการควบคุมบัญชีเมื่อจำเป็น"],
    ],
    panelTitle: "ทำความสะอาดครั้งใหญ่วันเสาร์",
    panelMeta: "Maria R. · 0.8 ไมล์ · คะแนน 4.9",
    panelAction: "ใบเสนอราคาพร้อมแล้ว",
    panelTotal: "รวม $90",
    panelSecure: "ปลอดภัย",
  },
};

export function forClientsCopy(locale: Locale): ForClientsCopy {
  const own = (forClientsCopyTable as Partial<Record<string, ForClientsCopy>>)[locale] ?? extraLocaleTables(locale)?.forClients;
  if (own) return own;
  const dictionary = getDictionary(locale);
  return {
    eyebrow: dictionary.nav.clients,
    title: dictionary.hero.highlight,
    body: dictionary.download.body,
    cta: dictionary.hero.findHelp,
    statA: dictionary.steps[0][0],
    statB: dictionary.steps[1][0],
    statC: dictionary.steps[2][0],
    cards: dictionary.steps.map(([title, text]) => [title, text]) as [string, string][],
    panelTitle: dictionary.steps[2][0],
    panelMeta: dictionary.download.pointA,
    panelAction: dictionary.download.badge,
    panelTotal: dictionary.nav.pricing,
    panelSecure: dictionary.trust.eyebrow,
  };
}
