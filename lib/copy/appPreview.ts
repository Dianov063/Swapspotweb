// Copy of the home page "Inside the app" section (components/AppPreview.tsx). Shipped locales
// without their own table keep the copy built from the dictionary; registry languages use their
// locale pack (lib/locales/<code>.json, keys `appPreview.*`).
import { extraLocaleTables } from "../extraLocales";
import { getDictionary } from "../i18n";
import type { Locale, ShippedLocale } from "../locales";

export type AppPreviewCopy = {
  eyebrow: string;
  title: string;
  mapTitle: string;
  mapBody: string;
  chips: string[];
  role: string;
  book: string;
  summary: string;
  service: string;
  with: string;
  date: string;
  total: string;
  pay: string;
  online: string;
  messageA: string;
  messageB: string;
  quote: string;
  approve: string;
};

export const appPreviewCopyTable: Partial<Record<ShippedLocale, AppPreviewCopy>> & { en: AppPreviewCopy } = {
  en: {
    eyebrow: "Inside the app",
    title: "A whole booking, start to finish",
    mapTitle: "Map view",
    mapBody: "12 helpers within 2 miles, live.",
    chips: ["Furniture", "TV mount", "Repairs"],
    role: "Handyman · 4.9 (124)",
    book: "Book",
    summary: "Booking summary",
    service: "Deep cleaning",
    with: "with Maria R.",
    date: "Sat, Jun 27 · 9:00 AM",
    total: "Total",
    pay: "Confirm & pay",
    online: "Online",
    messageA: "Hi! Can you do a 2-bed apartment Saturday?",
    messageB: "Yes! Sending a quote now.",
    quote: "Quote · Deep clean",
    approve: "Approve quote",
  },
  es: {
    eyebrow: "Dentro de la app",
    title: "Una reserva completa, de inicio a fin",
    mapTitle: "Vista de mapa",
    mapBody: "12 helpers a menos de 2 millas, en vivo.",
    chips: ["Muebles", "TV en pared", "Reparaciones"],
    role: "Handyman · 4.9 (124)",
    book: "Reservar",
    summary: "Resumen de reserva",
    service: "Limpieza profunda",
    with: "con Maria R.",
    date: "Sáb, Jun 27 · 9:00 AM",
    total: "Total",
    pay: "Confirmar y pagar",
    online: "En línea",
    messageA: "Hola, ¿puedes limpiar un apto de 2 cuartos el sábado?",
    messageB: "Sí, te envío un quote ahora.",
    quote: "Quote · Limpieza profunda",
    approve: "Aprobar quote",
  },
  zh: {
    eyebrow: "应用内体验",
    title: "从搜索到完成预订",
    mapTitle: "地图视图",
    mapBody: "2 英里内有 12 位 helpers，实时显示。",
    chips: ["家具", "电视安装", "维修"],
    role: "维修帮手 · 4.9 (124)",
    book: "预订",
    summary: "预订摘要",
    service: "深度清洁",
    with: "Maria R. 服务",
    date: "周六，6月27日 · 9:00 AM",
    total: "总计",
    pay: "确认并付款",
    online: "在线",
    messageA: "你好，周六可以清洁两居室公寓吗？",
    messageB: "可以！我现在发送 quote。",
    quote: "Quote · 深度清洁",
    approve: "批准 quote",
  },
  fr: {
    eyebrow: "Dans l'app",
    title: "Une réservation complète, du début à la fin",
    mapTitle: "Vue carte",
    mapBody: "12 helpers à moins de 2 miles, en direct.",
    chips: ["Meubles", "Support TV", "Réparations"],
    role: "Handyman · 4.9 (124)",
    book: "Réserver",
    summary: "Résumé de réservation",
    service: "Ménage profond",
    with: "avec Maria R.",
    date: "Sam, 27 juin · 9:00",
    total: "Total",
    pay: "Confirmer et payer",
    online: "En ligne",
    messageA: "Bonjour, pouvez-vous faire un 2 pièces samedi ?",
    messageB: "Oui ! J'envoie un quote maintenant.",
    quote: "Quote · Ménage profond",
    approve: "Approuver le quote",
  },
  ru: {
    eyebrow: "Внутри приложения",
    title: "Весь путь бронирования от начала до конца",
    mapTitle: "Карта",
    mapBody: "12 исполнителей в радиусе 2 миль.",
    chips: ["Сборка мебели", "Установка ТВ", "Мелкий ремонт"],
    role: "Мастер на все руки · 4,9 (124)",
    book: "Бронь",
    summary: "Детали бронирования",
    service: "Глубокая уборка",
    with: "с Марией Р.",
    date: "Сб, 27 июня · 9:00",
    total: "Итого",
    pay: "Подтвердить и оплатить",
    online: "Онлайн",
    messageA: "Привет! Сможешь убрать двухкомнатную квартиру в субботу?",
    messageB: "Да! Сейчас отправлю стоимость.",
    quote: "Стоимость · Глубокая уборка",
    approve: "Принять предложение",
  },
  vi: {
    eyebrow: "Bên trong ứng dụng",
    title: "Toàn bộ quá trình đặt lịch từ đầu đến cuối",
    mapTitle: "Bản đồ",
    mapBody: "12 người trợ giúp trong vòng 2 dặm, cập nhật trực tiếp.",
    chips: ["Đồ nội thất", "Lắp TV", "Sửa chữa"],
    role: "Thợ sửa chữa · 4,9 (124)",
    book: "Đặt lịch",
    summary: "Tóm tắt đặt lịch",
    service: "Dọn dẹp sâu",
    with: "với Maria R.",
    date: "Thứ Bảy, 27/6 · 9:00",
    total: "Tổng cộng",
    pay: "Xác nhận và thanh toán",
    online: "Trực tuyến",
    messageA: "Chào bạn! Bạn có thể dọn căn hộ 2 phòng ngủ vào thứ Bảy không?",
    messageB: "Được! Tôi gửi báo giá ngay đây.",
    quote: "Báo giá · Dọn dẹp sâu",
    approve: "Chấp nhận báo giá",
  },
  th: {
    eyebrow: "ภายในแอป",
    title: "ขั้นตอนการจองครบตั้งแต่ต้นจนจบ",
    mapTitle: "มุมมองแผนที่",
    mapBody: "ผู้ช่วย 12 คนในระยะ 2 ไมล์ อัปเดตแบบสด",
    chips: ["เฟอร์นิเจอร์", "ติดตั้งทีวี", "ซ่อมแซม"],
    role: "ช่างซ่อมบ้าน · 4.9 (124)",
    book: "จอง",
    summary: "สรุปการจอง",
    service: "ทำความสะอาดครั้งใหญ่",
    with: "กับ Maria R.",
    date: "เสาร์ 27 มิ.ย. · 9:00 น.",
    total: "รวม",
    pay: "ยืนยันและชำระเงิน",
    online: "ออนไลน์",
    messageA: "สวัสดี! วันเสาร์รับทำความสะอาดอพาร์ตเมนต์ 2 ห้องนอนไหม?",
    messageB: "ได้ค่ะ! กำลังส่งใบเสนอราคาให้ตอนนี้",
    quote: "ใบเสนอราคา · ทำความสะอาดครั้งใหญ่",
    approve: "อนุมัติใบเสนอราคา",
  },
};

export function appPreviewCopy(locale: Locale): AppPreviewCopy {
  const own = (appPreviewCopyTable as Partial<Record<string, AppPreviewCopy>>)[locale] ?? extraLocaleTables(locale)?.appPreview;
  if (own) return own;
  const dictionary = getDictionary(locale);
  return {
    eyebrow: dictionary.download.badge,
    title: dictionary.download.title,
    mapTitle: dictionary.steps[0][0],
    mapBody: dictionary.steps[0][1],
    chips: Object.values(dictionary.categories.names).slice(0, 3),
    role: dictionary.helpers.title,
    book: dictionary.hero.findHelp,
    summary: dictionary.steps[2][0],
    service: dictionary.categories.names.cleaning,
    with: dictionary.download.pointA,
    date: dictionary.waitlist.storeCaption,
    total: dictionary.nav.pricing,
    pay: dictionary.waitlist.join,
    online: dictionary.download.badge,
    messageA: dictionary.steps[1][0],
    messageB: dictionary.steps[1][1],
    quote: dictionary.steps[2][0],
    approve: dictionary.hero.findHelp,
  };
}
