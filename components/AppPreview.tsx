import { BadgeCheck, Calendar, Lock, MapPin, Sparkles } from "lucide-react";
import { SectionHead } from "./ui";
import { dictionaries, type Locale } from "@/lib/i18n";

const miniMarks = [
  { initials: "MR", tag: "$45", bg: "#E6F0E9", color: "#1B6B45", left: "28%", top: "48%", active: true },
  { initials: "JC", tag: "$50", bg: "#EAEFF6", color: "#3A5A8C", left: "64%", top: "34%" },
  { initials: "AL", tag: "$28", bg: "#F3E7EE", color: "#8C3A66", left: "52%", top: "74%" },
];

type AppPreviewCopy = {
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

const copy: Partial<Record<Locale, AppPreviewCopy>> & { en: AppPreviewCopy } = {
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

export default function AppPreview({ locale }: { locale: Locale }) {
  const dictionary = dictionaries[locale];
  const t =
    copy[locale] ??
    ({
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
    } satisfies AppPreviewCopy);

  return (
    <section className="mx-auto max-w-wrap px-6 py-[clamp(48px,6vw,86px)]">
      <SectionHead eyebrow={t.eyebrow} title={t.title} />

      <div className="mt-[46px] grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card-sm sm:-rotate-[1.2deg]">
          <div className="relative h-[188px] overflow-hidden bg-[#E6E4DC]">
            <div className="absolute -right-[10%] top-0 h-[46%] w-[60%] bg-[#CFE0EA]" />
            <div className="absolute -bottom-[6%] -left-[8%] h-[40%] w-[50%] bg-[#D4E7CD]" />
            <div className="absolute inset-x-0 top-1/2 h-[11px] bg-[#FCFCFA]" />
            <div className="absolute inset-y-0 left-[42%] w-[11px] bg-[#FCFCFA]" />
            {miniMarks.map((m) => (
              <div
                key={m.initials}
                className="absolute z-[3] flex -translate-x-1/2 -translate-y-full flex-col items-center"
                style={{ left: m.left, top: m.top }}
              >
                <span
                  className={`grid h-[27px] w-[27px] place-items-center rounded-full border-[2.5px] text-[9.5px] font-extrabold shadow-[0_4px_10px_rgba(20,42,30,.28)] ${
                    m.active ? "border-green" : "border-white"
                  }`}
                  style={{ background: m.bg, color: m.color }}
                >
                  {m.initials}
                </span>
                <span
                  className={`-mt-[5px] whitespace-nowrap rounded-full px-1.5 py-px text-[9px] font-extrabold shadow-[0_2px_6px_rgba(20,42,30,.2)] ${
                    m.active ? "bg-green text-white" : "bg-white text-ink"
                  }`}
                >
                  {m.tag}
                </span>
              </div>
            ))}
          </div>
          <div className="p-[16px_18px]">
            <div className="flex items-center gap-[7px] text-[14px] font-extrabold text-green">
              <MapPin className="h-4 w-4" />
              {t.mapTitle}
            </div>
            <div className="mt-1 text-[13.5px] text-ink-soft">{t.mapBody}</div>
          </div>
        </div>

        <div className="rounded-card border border-line bg-surface p-5 shadow-card-sm sm:rotate-[1deg]">
          <div className="flex items-center gap-3">
            <span className="grid h-[52px] w-[52px] place-items-center rounded-[15px] bg-[#EAEFF6] text-[17px] font-extrabold text-[#3A5A8C]">
              JC
            </span>
            <div>
              <div className="flex items-center gap-1.5 text-[16px] font-extrabold text-ink">
                James Carter <BadgeCheck className="h-4 w-4 text-green" />
              </div>
              <div className="text-[13px] font-semibold text-ink-soft">{t.role}</div>
            </div>
          </div>
          <div className="my-4 flex flex-wrap gap-[7px]">
            {t.chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full bg-green-soft px-[11px] py-[5px] text-[12px] font-bold text-green-deep"
              >
                {chip}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-line pt-3.5">
            <div className="text-[18px] font-extrabold text-ink">
              $50<span className="text-[12px] font-semibold text-ink-soft">{locale === "ru" ? "/ч" : "/hr"}</span>
            </div>
            <button type="button" className="rounded-[11px] bg-green px-[18px] py-2.5 text-[13.5px] font-extrabold text-white">
              {t.book}
            </button>
          </div>
        </div>

        <div className="rounded-card border border-line bg-surface p-5 shadow-card-sm sm:-rotate-[0.6deg]">
          <div className="mb-3.5 text-[15px] font-extrabold text-ink">{t.summary}</div>
          <div className="mb-3 flex items-center gap-[11px]">
            <span className="grid h-10 w-10 place-items-center rounded-[11px] bg-green-soft text-green">
              <Sparkles className="h-[19px] w-[19px]" />
            </span>
            <div>
              <div className="text-[14.5px] font-bold text-ink">{t.service}</div>
              <div className="text-[12.5px] font-semibold text-ink-soft">{t.with}</div>
            </div>
          </div>
          <div className="mb-3.5 flex items-center gap-2 text-[13.5px] font-semibold text-ink-soft">
            <Calendar className="h-4 w-4" />
            {t.date}
          </div>
          <div className="flex items-center justify-between border-t border-line pt-3">
            <span className="text-[13px] font-semibold text-ink-soft">{t.total}</span>
            <span className="text-[19px] font-extrabold text-ink">$90</span>
          </div>
          <button type="button" className="mt-3.5 flex w-full items-center justify-center gap-[7px] rounded-card-sm bg-green py-3 text-[14px] font-extrabold text-white">
            <Lock className="h-[15px] w-[15px]" />
            {t.pay}
          </button>
        </div>

        <div className="rounded-card border border-line bg-surface p-[18px_18px_20px] shadow-card-sm sm:rotate-[0.8deg]">
          <div className="mb-3.5 flex items-center gap-[9px] border-b border-line pb-3">
            <span className="grid h-[34px] w-[34px] place-items-center rounded-full bg-green-soft text-[12px] font-extrabold text-green">
              MR
            </span>
            <div className="leading-[1.2]">
              <div className="text-[14px] font-extrabold text-ink">Maria R.</div>
              <div className="flex items-center gap-1 text-[11.5px] font-bold text-green">
                <span className="h-[7px] w-[7px] rounded-full bg-green" />
                {t.online}
              </div>
            </div>
          </div>
          <div className="mb-2 max-w-[84%] rounded-[14px_14px_14px_4px] border border-line bg-cream px-3 py-[9px] text-[13px] text-ink">
            {t.messageA}
          </div>
          <div className="mb-3 ml-auto max-w-[84%] rounded-[14px_14px_4px_14px] bg-green px-3 py-[9px] text-[13px] text-white">
            {t.messageB}
          </div>
          <div className="rounded-[14px] border-[1.5px] border-green-soft bg-green-soft p-[13px]">
            <div className="mb-[9px] flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-green-deep">
                {t.quote}
              </span>
              <span className="text-[17px] font-extrabold text-ink">$120</span>
            </div>
            <button type="button" className="w-full rounded-[10px] bg-green py-[9px] text-[13px] font-extrabold text-white">
              {t.approve}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
