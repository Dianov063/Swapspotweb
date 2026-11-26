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
  en: "Page titles and navigation are localized. Full legal texts are in English. For legal or account-specific questions, contact hello@swapspot.org.",
  es: "Los títulos de las páginas y la navegación están traducidos. Los textos legales completos están en inglés. Si tienes preguntas legales o sobre tu cuenta, contacta con hello@swapspot.org.",
  zh: "页面标题和导航已本地化。完整的法律文本以英文提供。如有法律或账户相关问题，请联系 hello@swapspot.org。",
  fr: "Les titres des pages et la navigation sont traduits. Les textes juridiques complets sont en anglais. Pour toute question juridique ou concernant votre compte, contactez hello@swapspot.org.",
  ru: "Заголовки страниц и навигация переведены. Полные юридические тексты доступны на английском языке. По юридическим вопросам или вопросам вашего аккаунта пишите на hello@swapspot.org.",
  ar: "عناوين الصفحات والتنقل مترجمة. النصوص القانونية الكاملة باللغة الإنجليزية. للأسئلة القانونية أو الأسئلة المتعلقة بحسابك، تواصل عبر hello@swapspot.org.",
  pt: "Os títulos das páginas e a navegação estão traduzidos. Os textos jurídicos completos estão em inglês. Para questões jurídicas ou específicas da sua conta, entre em contato com hello@swapspot.org.",
  ht: "Tit paj yo ak meni navigasyon yo tradui. Tèks legal konplè yo an anglè. Pou kesyon legal oswa kesyon sou kont ou, kontakte hello@swapspot.org.",
  de: "Seitentitel und Navigation sind übersetzt. Die vollständigen Rechtstexte sind auf Englisch. Bei rechtlichen Fragen oder Fragen zu Ihrem Konto wenden Sie sich an hello@swapspot.org.",
  fil: "Isinalin ang mga pamagat ng pahina at mga menu sa pag-navigate. Nasa Ingles ang buong mga legal na teksto. Para sa mga legal na tanong o tanong tungkol sa account mo, makipag-ugnayan sa hello@swapspot.org.",
  hi: "पेज के शीर्षक और नेविगेशन आपकी भाषा में हैं। कानूनी दस्तावेज़ों का पूरा पाठ अंग्रेज़ी में है। कानूनी या आपके खाते से जुड़े सवालों के लिए hello@swapspot.org पर संपर्क करें।",
  bn: "পৃষ্ঠার শিরোনাম ও নেভিগেশন অনূদিত হয়েছে। সম্পূর্ণ আইনি পাঠ ইংরেজিতে রয়েছে। আইনি বা আপনার অ্যাকাউন্ট সম্পর্কিত প্রশ্নের জন্য hello@swapspot.org ঠিকানায় যোগাযোগ করুন।",
  te: "పేజీ శీర్షికలు, నావిగేషన్ అనువదించబడ్డాయి. పూర్తి చట్టపరమైన పాఠాలు ఆంగ్లంలో ఉన్నాయి. చట్టపరమైన లేదా మీ ఖాతాకు సంబంధించిన ప్రశ్నల కోసం hello@swapspot.org ను సంప్రదించండి.",
  ta: "பக்கத் தலைப்புகளும் வழிசெலுத்தலும் மொழிபெயர்க்கப்பட்டுள்ளன. முழுமையான சட்ட உரைகள் ஆங்கிலத்தில் உள்ளன. சட்டம் அல்லது உங்கள் கணக்கு தொடர்பான கேள்விகளுக்கு hello@swapspot.org என்ற முகவரியைத் தொடர்புகொள்ளுங்கள்.",
  vi: "Tiêu đề trang và phần điều hướng đã được dịch. Toàn bộ văn bản pháp lý bằng tiếng Anh. Nếu có câu hỏi pháp lý hoặc liên quan đến tài khoản, hãy liên hệ hello@swapspot.org.",
  th: "ชื่อหน้าและเมนูนำทางได้รับการแปลแล้ว เนื้อหาข้อความทางกฎหมายฉบับเต็มเป็นภาษาอังกฤษ หากมีคำถามด้านกฎหมายหรือเกี่ยวกับบัญชีของคุณ โปรดติดต่อ hello@swapspot.org",
};

export function staticPagesCopy(locale: Locale): StaticPagesCopy {
  const titles = (staticPageTitles as Partial<Record<string, Record<StaticPageSlug, string>>>)[locale];
  const intro = (staticPageIntros as Partial<Record<string, string>>)[locale];
  if (titles && intro) return { titles, intro };
  return extraLocaleTables(locale)?.staticPages ?? { titles: staticPageTitles.en, intro: staticPageIntros.en };
}
