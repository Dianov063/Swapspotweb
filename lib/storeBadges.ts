// Text of the App Store / Google Play buttons (components/AppStoreButtons.tsx) in the 16 site
// languages. The store names themselves are trademarks and stay as written; only the line above
// them and the accessible label are translated. Pure module for `npm run test:intl`.
import { extraLocaleTables } from "./extraLocales";
import type { Locale, ShippedLocale } from "./locales";

export type StoreBadgeCopy = {
  appStoreTop: string;
  playTop: string;
  appStoreLabel: string;
  playLabel: string;
};

export const storeBadgeCopy: Record<ShippedLocale, StoreBadgeCopy> = {
  en: {
    appStoreTop: "Download on the",
    playTop: "Get it on",
    appStoreLabel: "Download SwapSpot on the App Store",
    playLabel: "Get SwapSpot on Google Play",
  },
  es: {
    appStoreTop: "Descárgalo en el",
    playTop: "Disponible en",
    appStoreLabel: "Descarga SwapSpot en el App Store",
    playLabel: "Consigue SwapSpot en Google Play",
  },
  zh: {
    appStoreTop: "下载于",
    playTop: "立即获取于",
    appStoreLabel: "在 App Store 下载 SwapSpot",
    playLabel: "在 Google Play 获取 SwapSpot",
  },
  fr: {
    appStoreTop: "Télécharger dans l'",
    playTop: "Disponible sur",
    appStoreLabel: "Télécharger SwapSpot dans l'App Store",
    playLabel: "Obtenir SwapSpot sur Google Play",
  },
  ru: {
    appStoreTop: "Загрузите в",
    playTop: "Доступно в",
    appStoreLabel: "Скачать SwapSpot в App Store",
    playLabel: "Скачать SwapSpot в Google Play",
  },
  ar: {
    appStoreTop: "حمّله من",
    playTop: "احصل عليه من",
    appStoreLabel: "حمّل SwapSpot من App Store",
    playLabel: "احصل على SwapSpot من Google Play",
  },
  pt: {
    appStoreTop: "Baixar na",
    playTop: "Disponível no",
    appStoreLabel: "Baixe o SwapSpot na App Store",
    playLabel: "Baixe o SwapSpot no Google Play",
  },
  ht: {
    appStoreTop: "Telechaje sou",
    playTop: "Disponib sou",
    appStoreLabel: "Telechaje SwapSpot sou App Store",
    playLabel: "Jwenn SwapSpot sou Google Play",
  },
  de: {
    appStoreTop: "Laden im",
    playTop: "Jetzt bei",
    appStoreLabel: "SwapSpot im App Store laden",
    playLabel: "SwapSpot bei Google Play holen",
  },
  fil: {
    appStoreTop: "I-download sa",
    playTop: "Kunin ito sa",
    appStoreLabel: "I-download ang SwapSpot sa App Store",
    playLabel: "Kunin ang SwapSpot sa Google Play",
  },
  hi: {
    appStoreTop: "डाउनलोड करें",
    playTop: "यहां से पाएं",
    appStoreLabel: "App Store से SwapSpot डाउनलोड करें",
    playLabel: "Google Play से SwapSpot पाएं",
  },
  bn: {
    appStoreTop: "ডাউনলোড করুন",
    playTop: "এখান থেকে নিন",
    appStoreLabel: "App Store থেকে SwapSpot ডাউনলোড করুন",
    playLabel: "Google Play থেকে SwapSpot নিন",
  },
  te: {
    appStoreTop: "డౌన్‌లోడ్ చేయండి",
    playTop: "ఇక్కడ పొందండి",
    appStoreLabel: "App Store నుండి SwapSpot డౌన్‌లోడ్ చేయండి",
    playLabel: "Google Play నుండి SwapSpot పొందండి",
  },
  ta: {
    appStoreTop: "பதிவிறக்குங்கள்",
    playTop: "இதில் பெறுங்கள்",
    appStoreLabel: "App Store-இல் SwapSpot-ஐப் பதிவிறக்குங்கள்",
    playLabel: "Google Play-இல் SwapSpot-ஐப் பெறுங்கள்",
  },
  vi: {
    appStoreTop: "Tải về trên",
    playTop: "Tải nội dung trên",
    appStoreLabel: "Tải SwapSpot trên App Store",
    playLabel: "Tải SwapSpot trên Google Play",
  },
  th: {
    appStoreTop: "ดาวน์โหลดบน",
    playTop: "ดาวน์โหลดได้ที่",
    appStoreLabel: "ดาวน์โหลด SwapSpot บน App Store",
    playLabel: "ดาวน์โหลด SwapSpot บน Google Play",
  },
};

/** Server-side lookup; client components get the copy as a prop (see AppStoreButtons). */
export function storeBadgesFor(locale: Locale): StoreBadgeCopy {
  return (storeBadgeCopy as Partial<Record<string, StoreBadgeCopy>>)[locale] ?? extraLocaleTables(locale)?.storeBadges ?? storeBadgeCopy.en;
}
