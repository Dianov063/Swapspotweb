// Copy of the cookie consent banner (components/CookieConsent.tsx, a client component).
// Registry languages get their copy as a prop from the server layout (keys `cookieConsent.*`).
import type { ShippedLocale } from "../locales";

export type CookieConsentCopy = {
  title: string;
  body: string;
  accept: string;
  reject: string;
  privacy: string;
  settings: string;
  close: string;
};

export const cookieConsentCopyTable: Record<ShippedLocale, CookieConsentCopy> = {
  en: {
    title: "Your privacy choices",
    body: "We use Google Analytics cookies to understand visits and improve SwapSpot. You can accept or reject optional analytics cookies.",
    accept: "Accept",
    reject: "Reject",
    privacy: "Privacy policy",
    settings: "Cookie settings",
    close: "Close cookie settings",
  },
  es: {
    title: "Tus opciones de privacidad",
    body: "Usamos cookies de Google Analytics para entender las visitas y mejorar SwapSpot. Puedes aceptar o rechazar las cookies analíticas opcionales.",
    accept: "Aceptar",
    reject: "Rechazar",
    privacy: "Política de privacidad",
    settings: "Ajustes de cookies",
    close: "Cerrar ajustes de cookies",
  },
  zh: {
    title: "你的隐私选择",
    body: "我们使用 Google Analytics Cookie 来了解访问情况并改进 SwapSpot。你可以接受或拒绝可选的分析 Cookie。",
    accept: "接受",
    reject: "拒绝",
    privacy: "隐私政策",
    settings: "Cookie 设置",
    close: "关闭 Cookie 设置",
  },
  fr: {
    title: "Vos choix de confidentialité",
    body: "Nous utilisons les cookies Google Analytics pour comprendre les visites et améliorer SwapSpot. Vous pouvez accepter ou refuser les cookies d’analyse facultatifs.",
    accept: "Accepter",
    reject: "Refuser",
    privacy: "Politique de confidentialité",
    settings: "Paramètres des cookies",
    close: "Fermer les paramètres des cookies",
  },
  ru: {
    title: "Настройки конфиденциальности",
    body: "Мы используем файлы cookie Google Analytics, чтобы анализировать посещения и улучшать SwapSpot. Вы можете принять или отклонить необязательные аналитические cookie.",
    accept: "Принять",
    reject: "Отклонить",
    privacy: "Политика конфиденциальности",
    settings: "Настройки cookie",
    close: "Закрыть настройки cookie",
  },
  ar: {
    title: "خيارات الخصوصية",
    body: "نستخدم ملفات تعريف ارتباط Google Analytics لفهم الزيارات وتحسين SwapSpot. يمكنك قبول ملفات التحليلات الاختيارية أو رفضها.",
    accept: "قبول",
    reject: "رفض",
    privacy: "سياسة الخصوصية",
    settings: "إعدادات ملفات الارتباط",
    close: "إغلاق إعدادات ملفات الارتباط",
  },
  pt: {
    title: "Suas escolhas de privacidade",
    body: "Usamos cookies do Google Analytics para entender as visitas e melhorar o SwapSpot. Você pode aceitar ou recusar cookies analíticos opcionais.",
    accept: "Aceitar",
    reject: "Recusar",
    privacy: "Política de privacidade",
    settings: "Configurações de cookies",
    close: "Fechar configurações de cookies",
  },
  ht: {
    title: "Chwa konfidansyalite ou",
    body: "Nou itilize cookie Google Analytics pou konprann vizit yo epi amelyore SwapSpot. Ou ka aksepte oswa refize cookie analiz ki opsyonèl yo.",
    accept: "Aksepte",
    reject: "Refize",
    privacy: "Règleman konfidansyalite",
    settings: "Paramèt cookie",
    close: "Fèmen paramèt cookie",
  },
  de: {
    title: "Ihre Datenschutzauswahl",
    body: "Wir verwenden Google-Analytics-Cookies, um Besuche zu verstehen und SwapSpot zu verbessern. Sie können optionale Analyse-Cookies akzeptieren oder ablehnen.",
    accept: "Akzeptieren",
    reject: "Ablehnen",
    privacy: "Datenschutzerklärung",
    settings: "Cookie-Einstellungen",
    close: "Cookie-Einstellungen schließen",
  },
  fil: {
    title: "Iyong mga pagpipilian sa privacy",
    body: "Gumagamit kami ng Google Analytics cookies upang maunawaan ang mga pagbisita at mapahusay ang SwapSpot. Maaari mong tanggapin o tanggihan ang opsyonal na analytics cookies.",
    accept: "Tanggapin",
    reject: "Tanggihan",
    privacy: "Patakaran sa privacy",
    settings: "Mga setting ng cookie",
    close: "Isara ang mga setting ng cookie",
  },
  hi: {
    title: "आपकी गोपनीयता पसंद",
    body: "हम विज़िट को समझने और SwapSpot को बेहतर बनाने के लिए Google Analytics कुकीज़ का उपयोग करते हैं। आप वैकल्पिक एनालिटिक्स कुकीज़ स्वीकार या अस्वीकार कर सकते हैं।",
    accept: "स्वीकार करें",
    reject: "अस्वीकार करें",
    privacy: "गोपनीयता नीति",
    settings: "कुकी सेटिंग्स",
    close: "कुकी सेटिंग्स बंद करें",
  },
  bn: {
    title: "আপনার গোপনীয়তা পছন্দ",
    body: "ভিজিট বুঝতে এবং SwapSpot উন্নত করতে আমরা Google Analytics কুকি ব্যবহার করি। আপনি ঐচ্ছিক অ্যানালিটিক্স কুকি গ্রহণ বা প্রত্যাখ্যান করতে পারেন।",
    accept: "গ্রহণ করুন",
    reject: "প্রত্যাখ্যান করুন",
    privacy: "গোপনীয়তা নীতি",
    settings: "কুকি সেটিংস",
    close: "কুকি সেটিংস বন্ধ করুন",
  },
  te: {
    title: "మీ గోప్యత ఎంపికలు",
    body: "సందర్శనలను అర్థం చేసుకుని SwapSpotను మెరుగుపరచడానికి మేము Google Analytics కుకీలను ఉపయోగిస్తాము. ఐచ్ఛిక అనలిటిక్స్ కుకీలను మీరు అంగీకరించవచ్చు లేదా తిరస్కరించవచ్చు.",
    accept: "అంగీకరించు",
    reject: "తిరస్కరించు",
    privacy: "గోప్యతా విధానం",
    settings: "కుకీ సెట్టింగ్‌లు",
    close: "కుకీ సెట్టింగ్‌లను మూసివేయి",
  },
  ta: {
    title: "உங்கள் தனியுரிமைத் தேர்வுகள்",
    body: "வருகைகளைப் புரிந்துகொண்டு SwapSpot-ஐ மேம்படுத்த Google Analytics குக்கீகளைப் பயன்படுத்துகிறோம். விருப்பமான பகுப்பாய்வு குக்கீகளை ஏற்கலாம் அல்லது மறுக்கலாம்.",
    accept: "ஏற்கவும்",
    reject: "மறுக்கவும்",
    privacy: "தனியுரிமைக் கொள்கை",
    settings: "குக்கீ அமைப்புகள்",
    close: "குக்கீ அமைப்புகளை மூடு",
  },
  vi: {
    title: "Lựa chọn quyền riêng tư của bạn",
    body: "Chúng tôi dùng cookie Google Analytics để hiểu lượt truy cập và cải thiện SwapSpot. Bạn có thể chấp nhận hoặc từ chối cookie phân tích không bắt buộc.",
    accept: "Chấp nhận",
    reject: "Từ chối",
    privacy: "Chính sách quyền riêng tư",
    settings: "Cài đặt cookie",
    close: "Đóng cài đặt cookie",
  },
  th: {
    title: "ตัวเลือกความเป็นส่วนตัวของคุณ",
    body: "เราใช้คุกกี้ Google Analytics เพื่อทำความเข้าใจการเข้าชมและปรับปรุง SwapSpot คุณสามารถยอมรับหรือปฏิเสธคุกกี้การวิเคราะห์ที่ไม่บังคับได้",
    accept: "ยอมรับ",
    reject: "ปฏิเสธ",
    privacy: "นโยบายความเป็นส่วนตัว",
    settings: "การตั้งค่าคุกกี้",
    close: "ปิดการตั้งค่าคุกกี้",
  },
};
