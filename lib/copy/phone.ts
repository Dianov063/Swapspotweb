// Copy of the phone mockup in the home page hero (components/PhoneMockup.tsx).
import { extraLocaleTables } from "../extraLocales";
import type { Locale, ShippedLocale } from "../locales";

export type PhoneCopy = {
  search: string;
  nearby: string;
  service: string;
  distance: string;
  hour: string;
  book: string;
};

export const phoneCopyTable: Record<ShippedLocale, PhoneCopy> = {
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
  vi: { search: "Dịch vụ gần Oak Street", nearby: "12 người trợ giúp gần đây", service: "Dịch vụ dọn dẹp của Maria", distance: "0,6 dặm", hour: "/giờ", book: "Đặt ngay" },
  th: { search: "บริการใกล้ Oak Street", nearby: "ผู้ช่วย 12 คนใกล้คุณ", service: "บริการทำความสะอาดของ Maria", distance: "0.6 ไมล์", hour: "/ชม.", book: "จองเลย" },
};

export function phoneCopy(locale: Locale): PhoneCopy {
  return (phoneCopyTable as Partial<Record<string, PhoneCopy>>)[locale] ?? extraLocaleTables(locale)?.phone ?? phoneCopyTable.en;
}
