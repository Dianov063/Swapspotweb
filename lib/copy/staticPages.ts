// Titles and intro of the short localized notice pages (app/[locale]/[...slug]/page.tsx). The
// legal texts themselves stay English. Registry languages: keys `staticPages.*`.
import { extraLocaleTables } from "../extraLocales";
import type { Locale, ShippedLocale } from "../locales";

export const staticPageSlugs = [
  "privacy",
  "terms",
  "support",
  "contact",
  "account-deletion",
  "delete-account",
  "trust-safety",
] as const;

export type StaticPageSlug = (typeof staticPageSlugs)[number];

export type StaticPagesCopy = { titles: Record<StaticPageSlug, string>; intro: string };

export const staticPageTitles: Record<ShippedLocale, Record<StaticPageSlug, string>> = {
  en: {
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    support: "SwapSpot Support",
    contact: "Contact SwapSpot",
    "account-deletion": "Delete your SwapSpot account",
    "delete-account": "Delete your SwapSpot account",
    "trust-safety": "Trust & Safety",
  },
  es: {
    privacy: "Política de privacidad",
    terms: "Términos de servicio",
    support: "Soporte de SwapSpot",
    contact: "Contacto SwapSpot",
    "account-deletion": "Eliminar tu cuenta de SwapSpot",
    "delete-account": "Eliminar tu cuenta de SwapSpot",
    "trust-safety": "Confianza y seguridad",
  },
  zh: {
    privacy: "隐私政策",
    terms: "服务条款",
    support: "SwapSpot 支持",
    contact: "联系 SwapSpot",
    "account-deletion": "删除你的 SwapSpot 账户",
    "delete-account": "删除你的 SwapSpot 账户",
    "trust-safety": "信任与安全",
  },
  fr: {
    privacy: "Politique de confidentialité",
    terms: "Conditions d'utilisation",
    support: "Support SwapSpot",
    contact: "Contacter SwapSpot",
    "account-deletion": "Supprimer votre compte SwapSpot",
    "delete-account": "Supprimer votre compte SwapSpot",
    "trust-safety": "Confiance et sécurité",
  },
  ru: {
    privacy: "Политика конфиденциальности",
    terms: "Условия сервиса",
    support: "Поддержка SwapSpot",
    contact: "Контакты SwapSpot",
    "account-deletion": "Удаление аккаунта SwapSpot",
    "delete-account": "Удаление аккаунта SwapSpot",
    "trust-safety": "Доверие и безопасность",
  },
  ar: {
    privacy: "سياسة الخصوصية",
    terms: "شروط الخدمة",
    support: "دعم SwapSpot",
    contact: "اتصل بـ SwapSpot",
    "account-deletion": "حذف حساب SwapSpot",
    "delete-account": "حذف حساب SwapSpot",
    "trust-safety": "الثقة والأمان",
  },
  pt: {
    privacy: "Política de privacidade",
    terms: "Termos de serviço",
    support: "Suporte SwapSpot",
    contact: "Contato SwapSpot",
    "account-deletion": "Excluir sua conta SwapSpot",
    "delete-account": "Excluir sua conta SwapSpot",
    "trust-safety": "Confiança e segurança",
  },
  ht: {
    privacy: "Règleman konfidansyalite",
    terms: "Kondisyon sèvis",
    support: "Sipò SwapSpot",
    contact: "Kontakte SwapSpot",
    "account-deletion": "Efase kont SwapSpot ou",
    "delete-account": "Efase kont SwapSpot ou",
    "trust-safety": "Konfyans ak sekirite",
  },
  de: {
    privacy: "Datenschutzerklärung",
    terms: "Nutzungsbedingungen",
    support: "SwapSpot Support",
    contact: "SwapSpot Kontakt",
    "account-deletion": "SwapSpot Konto löschen",
    "delete-account": "SwapSpot Konto löschen",
    "trust-safety": "Vertrauen & Sicherheit",
  },
  fil: {
    privacy: "Patakaran sa Privacy",
    terms: "Mga Tuntunin ng Serbisyo",
    support: "Suporta ng SwapSpot",
    contact: "Kontakin ang SwapSpot",
    "account-deletion": "I-delete ang iyong SwapSpot account",
    "delete-account": "I-delete ang iyong SwapSpot account",
    "trust-safety": "Tiwala at Kaligtasan",
  },
  hi: {
    privacy: "गोपनीयता नीति",
    terms: "सेवा की शर्तें",
    support: "SwapSpot सहायता",
    contact: "SwapSpot से संपर्क करें",
    "account-deletion": "अपना SwapSpot खाता हटाएं",
    "delete-account": "अपना SwapSpot खाता हटाएं",
    "trust-safety": "भरोसा और सुरक्षा",
  },
  bn: {
    privacy: "গোপনীয়তা নীতি",
    terms: "সেবার শর্তাবলী",
    support: "SwapSpot সহায়তা",
    contact: "SwapSpot যোগাযোগ",
    "account-deletion": "আপনার SwapSpot অ্যাকাউন্ট মুছুন",
    "delete-account": "আপনার SwapSpot অ্যাকাউন্ট মুছুন",
    "trust-safety": "বিশ্বাস ও নিরাপত্তা",
  },
  te: {
    privacy: "గోప్యతా విధానం",
    terms: "సేవా నిబంధనలు",
    support: "SwapSpot సహాయం",
    contact: "SwapSpot సంప్రదించండి",
    "account-deletion": "మీ SwapSpot ఖాతాను తొలగించండి",
    "delete-account": "మీ SwapSpot ఖాతాను తొలగించండి",
    "trust-safety": "నమ్మకం మరియు భద్రత",
  },
  ta: {
    privacy: "தனியுரிமைக் கொள்கை",
    terms: "சேவை விதிமுறைகள்",
    support: "SwapSpot உதவி",
    contact: "SwapSpot தொடர்பு",
    "account-deletion": "உங்கள் SwapSpot கணக்கை நீக்கவும்",
    "delete-account": "உங்கள் SwapSpot கணக்கை நீக்கவும்",
    "trust-safety": "நம்பிக்கை மற்றும் பாதுகாப்பு",
  },
  vi: {
    privacy: "Chính sách quyền riêng tư",
    terms: "Điều khoản dịch vụ",
    support: "Hỗ trợ SwapSpot",
    contact: "Liên hệ SwapSpot",
    "account-deletion": "Xóa tài khoản SwapSpot của bạn",
    "delete-account": "Xóa tài khoản SwapSpot của bạn",
    "trust-safety": "Tin cậy & An toàn",
  },
  th: {
    privacy: "นโยบายความเป็นส่วนตัว",
    terms: "ข้อกำหนดการให้บริการ",
    support: "ฝ่ายช่วยเหลือ SwapSpot",
    contact: "ติดต่อ SwapSpot",
    "account-deletion": "ลบบัญชี SwapSpot ของคุณ",
    "delete-account": "ลบบัญชี SwapSpot ของคุณ",
    "trust-safety": "ความไว้วางใจและความปลอดภัย",
  },
};

export const staticPageIntros: Record<ShippedLocale, string> = {
  en: "This page is available in your selected language. For legal or account-specific questions, contact hello@swapspot.org.",
  es: "Esta página está disponible en tu idioma seleccionado. Para preguntas legales o de cuenta, escribe a hello@swapspot.org.",
  zh: "此页面已使用你选择的语言显示。如有法律或账户问题，请联系 hello@swapspot.org。",
  fr: "Cette page est disponible dans la langue sélectionnée. Pour les questions juridiques ou de compte, contactez hello@swapspot.org.",
  ru: "Эта страница доступна на выбранном языке. По юридическим вопросам или вопросам аккаунта пишите на hello@swapspot.org.",
  ar: "هذه الصفحة متاحة باللغة المحددة. للأسئلة القانونية أو أسئلة الحساب، تواصل عبر hello@swapspot.org.",
  pt: "Esta página está disponível no idioma selecionado. Para dúvidas legais ou de conta, escreva para hello@swapspot.org.",
  ht: "Paj sa a disponib nan lang ou chwazi a. Pou kesyon legal oswa kont, ekri hello@swapspot.org.",
  de: "Diese Seite ist in der ausgewählten Sprache verfügbar. Für rechtliche Fragen oder Kontofragen kontaktieren Sie hello@swapspot.org.",
  fil: "Available ang page na ito sa pinili mong wika. Para sa legal o account questions, mag-email sa hello@swapspot.org.",
  hi: "यह पेज आपकी चुनी हुई भाषा में उपलब्ध है। कानूनी या खाते से जुड़े सवालों के लिए hello@swapspot.org पर संपर्क करें।",
  bn: "এই পেজটি আপনার নির্বাচিত ভাষায় উপলব্ধ। আইনি বা অ্যাকাউন্ট সম্পর্কিত প্রশ্নের জন্য hello@swapspot.org এ যোগাযোগ করুন।",
  te: "ఈ పేజీ మీరు ఎంచుకున్న భాషలో అందుబాటులో ఉంది. చట్టపరమైన లేదా ఖాతా ప్రశ్నలకు hello@swapspot.org కు రాయండి.",
  ta: "இந்த பக்கம் நீங்கள் தேர்ந்தெடுத்த மொழியில் கிடைக்கிறது. சட்ட அல்லது கணக்கு கேள்விகளுக்கு hello@swapspot.org-க்கு எழுதுங்கள்.",
  vi: "Trang này có sẵn bằng ngôn ngữ bạn đã chọn. Nếu có câu hỏi pháp lý hoặc về tài khoản, hãy liên hệ hello@swapspot.org.",
  th: "หน้านี้แสดงเป็นภาษาที่คุณเลือก สำหรับคำถามด้านกฎหมายหรือบัญชี โปรดติดต่อ hello@swapspot.org",
};

export function staticPagesCopy(locale: Locale): StaticPagesCopy {
  const titles = (staticPageTitles as Partial<Record<string, Record<StaticPageSlug, string>>>)[locale];
  const intro = (staticPageIntros as Partial<Record<string, string>>)[locale];
  if (titles && intro) return { titles, intro };
  return extraLocaleTables(locale)?.staticPages ?? { titles: staticPageTitles.en, intro: staticPageIntros.en };
}
