// Names of the 14 service categories in the 16 site languages (catalog labels, not user content).
// Keys are the site category slugs (lib/data.ts); backend directory slugs such as
// `home-repair-and-maintenance` map to them by dropping "-and-".
import { extraLocaleTables } from "./extraLocales";
import type { Locale, ShippedLocale } from "./locales";

export const categorySlugs = [
  "home-repair-maintenance",
  "construction-remodeling",
  "cleaning",
  "lawn-outdoor",
  "moving-delivery",
  "tech-smart-home",
  "tutoring-lessons",
  "beauty-wellness",
  "care-assistance",
  "events-entertainment",
  "professional-services",
  "pet-services",
  "design-creative",
  "specialty-seasonal",
] as const;

// Same order as `categorySlugs`.
export const categoryNamesTable: Record<ShippedLocale, readonly string[]> = {
  en: ["Home Repair & Maintenance", "Construction & Remodeling", "Cleaning", "Lawn & Outdoor", "Moving & Delivery", "Tech & Smart Home", "Tutoring & Lessons", "Beauty & Wellness", "Care & Assistance", "Events & Entertainment", "Professional Services", "Pet Services", "Design & Creative", "Specialty & Seasonal"],
  es: ["Reparación y mantenimiento del hogar", "Construcción y remodelación", "Limpieza", "Jardín y exteriores", "Mudanzas y entregas", "Tecnología y hogar inteligente", "Clases y tutorías", "Belleza y bienestar", "Cuidado y asistencia", "Eventos y entretenimiento", "Servicios profesionales", "Servicios para mascotas", "Diseño y creatividad", "Especiales y de temporada"],
  zh: ["家居维修与保养", "建筑与装修", "清洁", "草坪与户外", "搬家与配送", "科技与智能家居", "辅导与课程", "美容与健康", "照护与协助", "活动与娱乐", "专业服务", "宠物服务", "设计与创意", "特色与季节性服务"],
  fr: ["Réparation et entretien de la maison", "Construction et rénovation", "Ménage", "Jardin et extérieur", "Déménagement et livraison", "Tech et maison connectée", "Cours et soutien scolaire", "Beauté et bien-être", "Aide et accompagnement", "Événements et animation", "Services professionnels", "Services pour animaux", "Design et création", "Services spéciaux et saisonniers"],
  ru: ["Ремонт и обслуживание дома", "Строительство и отделка", "Уборка", "Сад и участок", "Переезды и доставка", "Техника и умный дом", "Репетиторы и уроки", "Красота и здоровье", "Уход и помощь", "Мероприятия и развлечения", "Профессиональные услуги", "Услуги для животных", "Дизайн и творчество", "Особые и сезонные услуги"],
  ar: ["إصلاح المنزل وصيانته", "البناء والتجديد", "التنظيف", "الحدائق والمساحات الخارجية", "النقل والتوصيل", "التقنية والمنزل الذكي", "الدروس والتعليم", "التجميل والعافية", "الرعاية والمساعدة", "المناسبات والترفيه", "الخدمات المهنية", "خدمات الحيوانات الأليفة", "التصميم والإبداع", "خدمات خاصة وموسمية"],
  pt: ["Reparos e manutenção da casa", "Construção e reforma", "Limpeza", "Jardim e área externa", "Mudanças e entregas", "Tecnologia e casa inteligente", "Aulas e reforço escolar", "Beleza e bem-estar", "Cuidados e assistência", "Eventos e entretenimento", "Serviços profissionais", "Serviços para pets", "Design e criação", "Serviços especiais e sazonais"],
  ht: ["Reparasyon ak antretyen kay", "Konstriksyon ak renovasyon", "Netwayaj", "Jaden ak deyò", "Demenajman ak livrezon", "Teknoloji ak kay entèlijan", "Leson ak repetitè", "Bote ak byennèt", "Swen ak asistans", "Evènman ak divètisman", "Sèvis pwofesyonèl", "Sèvis pou bèt", "Design ak kreyasyon", "Sèvis espesyal ak sezonye"],
  de: ["Hausreparatur & Instandhaltung", "Bau & Renovierung", "Reinigung", "Garten & Außenbereich", "Umzug & Lieferung", "Technik & Smart Home", "Nachhilfe & Unterricht", "Beauty & Wellness", "Betreuung & Unterstützung", "Events & Unterhaltung", "Professionelle Dienstleistungen", "Tierbetreuung", "Design & Kreatives", "Spezial- & Saisonservices"],
  fil: ["Pagkukumpuni at Maintenance ng Bahay", "Konstruksyon at Renovation", "Paglilinis", "Hardin at Labas ng Bahay", "Paglipat at Delivery", "Tech at Smart Home", "Tutoring at Leksyon", "Beauty at Wellness", "Pag-aalaga at Tulong", "Events at Libangan", "Propesyonal na Serbisyo", "Serbisyo para sa Alagang Hayop", "Disenyo at Creative", "Espesyal at Pana-panahon"],
  hi: ["घर की मरम्मत और रखरखाव", "निर्माण और रीमॉडलिंग", "सफ़ाई", "लॉन और बाहरी काम", "शिफ्टिंग और डिलीवरी", "टेक और स्मार्ट होम", "ट्यूशन और कक्षाएं", "ब्यूटी और वेलनेस", "देखभाल और सहायता", "इवेंट और मनोरंजन", "पेशेवर सेवाएं", "पालतू जानवरों की सेवाएं", "डिज़ाइन और क्रिएटिव", "विशेष और मौसमी सेवाएं"],
  bn: ["বাড়ি মেরামত ও রক্ষণাবেক্ষণ", "নির্মাণ ও সংস্কার", "পরিষ্কার-পরিচ্ছন্নতা", "লন ও বাইরের কাজ", "স্থানান্তর ও ডেলিভারি", "প্রযুক্তি ও স্মার্ট হোম", "টিউশন ও পাঠ", "সৌন্দর্য ও সুস্থতা", "যত্ন ও সহায়তা", "অনুষ্ঠান ও বিনোদন", "পেশাদার সেবা", "পোষা প্রাণীর সেবা", "ডিজাইন ও সৃজনশীল", "বিশেষ ও মৌসুমি সেবা"],
  te: ["ఇంటి మరమ్మతు మరియు నిర్వహణ", "నిర్మాణం మరియు పునర్నిర్మాణం", "శుభ్రత", "లాన్ మరియు బయటి పనులు", "ఇల్లు మార్పు మరియు డెలివరీ", "టెక్ మరియు స్మార్ట్ హోమ్", "ట్యూషన్ మరియు పాఠాలు", "అందం మరియు ఆరోగ్యం", "సంరక్షణ మరియు సహాయం", "ఈవెంట్‌లు మరియు వినోదం", "ప్రొఫెషనల్ సేవలు", "పెంపుడు జంతువుల సేవలు", "డిజైన్ మరియు క్రియేటివ్", "ప్రత్యేక మరియు సీజనల్ సేవలు"],
  ta: ["வீட்டு பழுது மற்றும் பராமரிப்பு", "கட்டுமானம் மற்றும் புதுப்பித்தல்", "சுத்தம்", "புல்வெளி மற்றும் வெளிப்புறம்", "இடமாற்றம் மற்றும் டெலிவரி", "தொழில்நுட்பம் மற்றும் ஸ்மார்ட் வீடு", "பயிற்சி மற்றும் வகுப்புகள்", "அழகு மற்றும் நலம்", "பராமரிப்பு மற்றும் உதவி", "நிகழ்வுகள் மற்றும் பொழுதுபோக்கு", "தொழில்முறை சேவைகள்", "செல்லப்பிராணி சேவைகள்", "வடிவமைப்பு மற்றும் படைப்பாற்றல்", "சிறப்பு மற்றும் பருவகால சேவைகள்"],
  vi: ["Sửa chữa và bảo trì nhà", "Xây dựng và cải tạo", "Dọn dẹp", "Sân vườn và ngoài trời", "Chuyển nhà và giao hàng", "Công nghệ và nhà thông minh", "Gia sư và lớp học", "Làm đẹp và chăm sóc sức khỏe", "Chăm sóc và hỗ trợ", "Sự kiện và giải trí", "Dịch vụ chuyên nghiệp", "Dịch vụ thú cưng", "Thiết kế và sáng tạo", "Dịch vụ đặc biệt và theo mùa"],
  th: ["ซ่อมแซมและบำรุงรักษาบ้าน", "ก่อสร้างและรีโนเวต", "ทำความสะอาด", "สนามหญ้าและพื้นที่กลางแจ้ง", "ขนย้ายและจัดส่ง", "เทคโนโลยีและสมาร์ทโฮม", "ติวเตอร์และบทเรียน", "ความงามและสุขภาพ", "ดูแลและช่วยเหลือ", "งานอีเวนต์และความบันเทิง", "บริการมืออาชีพ", "บริการสัตว์เลี้ยง", "ออกแบบและงานสร้างสรรค์", "บริการพิเศษและตามฤดูกาล"],
};

/** Translated category name for a site or backend slug, or null when the category is unknown. */
export function categoryName(slug: string | null | undefined, locale: Locale): string | null {
  const raw = String(slug ?? "");
  const index = categorySlugs.indexOf((raw.replace(/-and-/g, "-") as (typeof categorySlugs)[number]));
  if (index < 0) return null;
  const shipped = (categoryNamesTable as Partial<Record<string, readonly string[]>>)[locale];
  if (shipped) return shipped[index] ?? categoryNamesTable.en[index];
  return extraLocaleTables(locale)?.categories[categorySlugs[index]] ?? categoryNamesTable.en[index];
}
