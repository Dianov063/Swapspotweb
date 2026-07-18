import { Search, Star, Users } from "lucide-react";
import type { Locale } from "@/lib/i18n";

type PhoneCopy = {
  search: string;
  nearby: string;
  service: string;
  distance: string;
  hour: string;
  book: string;
};

const phoneCopy: Record<Locale, PhoneCopy> = {
  en: { search: "Services near Oak Street", nearby: "12 helpers nearby", service: "Maria's Cleaning", distance: "0.6 mi", hour: "/hr", book: "Book now" },
  es: { search: "Servicios cerca de Oak Street", nearby: "12 profesionales cerca", service: "Limpieza de Maria", distance: "0,6 mi", hour: "/h", book: "Reservar" },
  zh: { search: "Oak Street 附近的服务", nearby: "附近有 12 位服务者", service: "Maria 的清洁服务", distance: "0.6 英里", hour: "/小时", book: "立即预订" },
  fr: { search: "Services près d'Oak Street", nearby: "12 prestataires proches", service: "Ménage de Maria", distance: "0,6 mi", hour: "/h", book: "Réserver" },
  ru: { search: "Услуги рядом с Оук-стрит", nearby: "12 исполнителей рядом", service: "Уборка от Марии", distance: "0,6 мили", hour: "/ч", book: "Забронировать" },
  ar: { search: "خدمات بالقرب من Oak Street", nearby: "12 مقدم خدمة بالقرب منك", service: "خدمة تنظيف ماريا", distance: "0.6 ميل", hour: "/ساعة", book: "احجز الآن" },
  pt: { search: "Serviços perto da Oak Street", nearby: "12 profissionais por perto", service: "Limpeza da Maria", distance: "0,6 mi", hour: "/h", book: "Reservar" },
  ht: { search: "Sèvis toupre Oak Street", nearby: "12 pwofesyonèl toupre", service: "Netwayaj Maria", distance: "0.6 mi", hour: "/èdtan", book: "Rezève" },
  de: { search: "Dienste nahe Oak Street", nearby: "12 Anbieter in der Nähe", service: "Marias Reinigung", distance: "0,6 mi", hour: "/Std.", book: "Buchen" },
  fil: { search: "Mga serbisyo malapit sa Oak Street", nearby: "12 provider sa malapit", service: "Paglilinis ni Maria", distance: "0.6 mi", hour: "/oras", book: "Mag-book" },
  hi: { search: "Oak Street के पास सेवाएं", nearby: "12 सेवा प्रदाता पास में", service: "मारिया की सफाई सेवा", distance: "0.6 मील", hour: "/घंटा", book: "बुक करें" },
  bn: { search: "Oak Street-এর কাছাকাছি সেবা", nearby: "কাছাকাছি ১২ জন সেবাদাতা", service: "মারিয়ার পরিচ্ছন্নতা", distance: "০.৬ মাইল", hour: "/ঘণ্টা", book: "বুক করুন" },
  te: { search: "Oak Street సమీపంలోని సేవలు", nearby: "సమీపంలో 12 మంది సేవాదారులు", service: "మారియా క్లీనింగ్", distance: "0.6 మై.", hour: "/గం.", book: "బుక్ చేయండి" },
  ta: { search: "Oak Street அருகிலுள்ள சேவைகள்", nearby: "அருகில் 12 சேவை வழங்குநர்கள்", service: "மரியாவின் சுத்தம்", distance: "0.6 மைல்", hour: "/மணி", book: "பதிவு செய்க" },
};

const helpers = [
  { initials: "MR", tag: "Maria · $45", bg: "#E6F0E9", color: "#1B6B45", left: "26%", top: "44%", active: true },
  { initials: "JC", tag: "$50", bg: "#EAEFF6", color: "#3A5A8C", left: "64%", top: "30%" },
  { initials: "AL", tag: "$28", bg: "#F3E7EE", color: "#8C3A66", left: "46%", top: "62%" },
  { initials: "DT", tag: "$35", bg: "#F7EAD2", color: "#8A5B12", left: "77%", top: "66%" },
];

/**
 * Pure-CSS phone + map mockup. No real images (per brief — no stock photos).
 * Reused on the homepage hero; lift into /helpers or city pages as needed.
 */
export default function PhoneMockup({ locale }: { locale: Locale }) {
  const copy = phoneCopy[locale];

  return (
    <div className="relative aspect-[300/620] w-[clamp(264px,84%,314px)] rounded-[46px] bg-[#1E2A24] p-[11px] shadow-[0_40px_80px_-30px_rgba(20,42,30,.5),0_8px_24px_rgba(20,42,30,.18)]">
      <div className="absolute left-1/2 top-5 z-[8] h-6 w-[90px] -translate-x-1/2 rounded-b-2xl bg-[#1E2A24]" />
      <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-[#E6E4DC]">
        {/* map base */}
        <div className="absolute -right-[12%] top-0 h-[40%] w-[62%] rounded-bl-[46px] bg-[#CFE0EA]" />
        <div className="absolute bottom-[30%] -left-[10%] h-[30%] w-[52%] rounded-r-[34px] bg-[#D4E7CD]" />
        {/* roads */}
        <div className="absolute -left-[6%] -right-[6%] top-[45%] h-[15px] bg-[#FCFCFA]" />
        <div className="absolute -bottom-[34%] left-[36%] top-[-6%] w-[15px] bg-[#FCFCFA]" />
        <div className="absolute -left-[6%] -right-[6%] top-[67%] h-[11px] bg-[#FCFCFA]" />
        <div className="absolute -bottom-[6%] left-[70%] top-[8%] w-[11px] bg-[#FCFCFA]" />

        {/* search bar */}
        <div className="absolute left-3.5 right-3.5 top-[52px] flex items-center gap-2.5 rounded-[14px] bg-white px-3.5 py-[11px] shadow-[0_6px_18px_rgba(20,42,30,.12)]">
          <Search className="h-[17px] w-[17px] text-green" />
          <span className="text-[12.5px] font-semibold text-[#7A857E]">
            {copy.search}
          </span>
          <span className="ml-auto h-2 w-2 rounded-full bg-gold" />
        </div>

        {/* live count */}
        <div className="absolute left-3.5 top-[90px] z-[6] inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-green px-[11px] py-1.5 text-[11px] font-bold text-white shadow-[0_4px_12px_rgba(20,42,30,.25)]">
          <Users className="h-[13px] w-[13px]" />
          {copy.nearby}
        </div>

        {/* helper markers */}
        {helpers.map((h) => (
          <div
            key={h.initials}
            className={`absolute flex -translate-x-1/2 -translate-y-full flex-col items-center ${
              h.active ? "z-[7]" : "z-[5]"
            }`}
            style={{ left: h.left, top: h.top }}
          >
            <span
              className={`grid place-items-center rounded-full border-[3px] font-extrabold ${
                h.active
                  ? "h-11 w-11 border-green text-[12.5px] shadow-[0_7px_18px_rgba(27,107,69,.45)]"
                  : "h-[38px] w-[38px] border-white text-[12.5px] shadow-[0_5px_14px_rgba(20,42,30,.3)]"
              }`}
              style={{ background: h.bg, color: h.color }}
            >
              {h.initials}
            </span>
            <span
              className={`-mt-[7px] whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] font-extrabold shadow-[0_3px_8px_rgba(20,42,30,.2)] ${
                h.active ? "bg-green text-white" : "bg-white text-ink"
              }`}
            >
              {h.tag}
            </span>
          </div>
        ))}

        {/* bottom sheet */}
        <div className="absolute inset-x-0 bottom-0 rounded-t-[22px] bg-white px-4 pb-[18px] pt-3 shadow-[0_-8px_24px_rgba(20,42,30,.1)]">
          <div className="mx-auto mb-3 h-1 w-[38px] rounded-full bg-[#E3E1D9]" />
          <div className="flex items-center gap-[11px]">
            <span className="grid h-[46px] w-[46px] place-items-center rounded-[14px] bg-green-soft text-[15px] font-extrabold text-green">
              MR
            </span>
            <div className="min-w-0 flex-1 leading-[1.25]">
              <div className="text-[14.5px] font-extrabold text-ink">
                {copy.service}
              </div>
              <div className="flex items-center gap-1 text-[12px] font-semibold text-[#7A857E]">
                <Star className="h-3 w-3 text-gold" fill="currentColor" />
                4.9 (128) · {copy.distance}
              </div>
            </div>
            <div className="text-[15px] font-extrabold text-ink">
              $45<span className="text-[11px] font-semibold text-[#7A857E]">{copy.hour}</span>
            </div>
          </div>
          <button
            type="button"
            className="mt-3 w-full rounded-[13px] bg-green py-3 text-[14px] font-extrabold text-white"
          >
            {copy.book}
          </button>
        </div>
      </div>
    </div>
  );
}
