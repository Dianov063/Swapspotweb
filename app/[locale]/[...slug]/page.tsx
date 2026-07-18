import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrustSafety from "@/components/TrustSafety";
import { dictionaries, isLocale, localizedPath, locales, type Locale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string; slug: string[] }> };

const supportedPages = [
  "privacy",
  "terms",
  "support",
  "contact",
  "account-deletion",
  "delete-account",
  "helpers",
  "trust-safety",
] as const;

type SupportedPage = (typeof supportedPages)[number];

const localizedTitles: Record<Locale, Record<SupportedPage, string>> = {
  en: {
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    support: "SwapSpot Support",
    contact: "Contact SwapSpot",
    "account-deletion": "Delete your SwapSpot account",
    "delete-account": "Delete your SwapSpot account",
    helpers: "Become a Helper",
    "trust-safety": "Trust & Safety",
  },
  es: {
    privacy: "Política de privacidad",
    terms: "Términos de servicio",
    support: "Soporte de SwapSpot",
    contact: "Contacto SwapSpot",
    "account-deletion": "Eliminar tu cuenta de SwapSpot",
    "delete-account": "Eliminar tu cuenta de SwapSpot",
    helpers: "Ser Helper",
    "trust-safety": "Confianza y seguridad",
  },
  zh: {
    privacy: "隐私政策",
    terms: "服务条款",
    support: "SwapSpot 支持",
    contact: "联系 SwapSpot",
    "account-deletion": "删除你的 SwapSpot 账户",
    "delete-account": "删除你的 SwapSpot 账户",
    helpers: "成为 Helper",
    "trust-safety": "信任与安全",
  },
  fr: {
    privacy: "Politique de confidentialité",
    terms: "Conditions d'utilisation",
    support: "Support SwapSpot",
    contact: "Contacter SwapSpot",
    "account-deletion": "Supprimer votre compte SwapSpot",
    "delete-account": "Supprimer votre compte SwapSpot",
    helpers: "Devenir Helper",
    "trust-safety": "Confiance et sécurité",
  },
  ru: {
    privacy: "Политика конфиденциальности",
    terms: "Условия сервиса",
    support: "Поддержка SwapSpot",
    contact: "Контакты SwapSpot",
    "account-deletion": "Удаление аккаунта SwapSpot",
    "delete-account": "Удаление аккаунта SwapSpot",
    helpers: "Стать Helper",
    "trust-safety": "Доверие и безопасность",
  },
  ar: {
    privacy: "سياسة الخصوصية",
    terms: "شروط الخدمة",
    support: "دعم SwapSpot",
    contact: "اتصل بـ SwapSpot",
    "account-deletion": "حذف حساب SwapSpot",
    "delete-account": "حذف حساب SwapSpot",
    helpers: "كن مساعدا",
    "trust-safety": "الثقة والأمان",
  },
  pt: {
    privacy: "Política de privacidade",
    terms: "Termos de serviço",
    support: "Suporte SwapSpot",
    contact: "Contato SwapSpot",
    "account-deletion": "Excluir sua conta SwapSpot",
    "delete-account": "Excluir sua conta SwapSpot",
    helpers: "Virar Helper",
    "trust-safety": "Confiança e segurança",
  },
  ht: {
    privacy: "Règleman konfidansyalite",
    terms: "Kondisyon sèvis",
    support: "Sipò SwapSpot",
    contact: "Kontakte SwapSpot",
    "account-deletion": "Efase kont SwapSpot ou",
    "delete-account": "Efase kont SwapSpot ou",
    helpers: "Vin Helper",
    "trust-safety": "Konfyans ak sekirite",
  },
  de: {
    privacy: "Datenschutzerklärung",
    terms: "Nutzungsbedingungen",
    support: "SwapSpot Support",
    contact: "SwapSpot Kontakt",
    "account-deletion": "SwapSpot Konto löschen",
    "delete-account": "SwapSpot Konto löschen",
    helpers: "Helper werden",
    "trust-safety": "Vertrauen & Sicherheit",
  },
  fil: {
    privacy: "Patakaran sa Privacy",
    terms: "Mga Tuntunin ng Serbisyo",
    support: "Suporta ng SwapSpot",
    contact: "Kontakin ang SwapSpot",
    "account-deletion": "I-delete ang iyong SwapSpot account",
    "delete-account": "I-delete ang iyong SwapSpot account",
    helpers: "Maging Helper",
    "trust-safety": "Trust & Safety",
  },
  hi: {
    privacy: "गोपनीयता नीति",
    terms: "सेवा की शर्तें",
    support: "SwapSpot सहायता",
    contact: "SwapSpot से संपर्क करें",
    "account-deletion": "अपना SwapSpot खाता हटाएं",
    "delete-account": "अपना SwapSpot खाता हटाएं",
    helpers: "Helper बनें",
    "trust-safety": "भरोसा और सुरक्षा",
  },
  bn: {
    privacy: "গোপনীয়তা নীতি",
    terms: "সেবার শর্তাবলী",
    support: "SwapSpot সহায়তা",
    contact: "SwapSpot যোগাযোগ",
    "account-deletion": "আপনার SwapSpot অ্যাকাউন্ট মুছুন",
    "delete-account": "আপনার SwapSpot অ্যাকাউন্ট মুছুন",
    helpers: "Helper হন",
    "trust-safety": "বিশ্বাস ও নিরাপত্তা",
  },
  te: {
    privacy: "గోప్యతా విధానం",
    terms: "సేవా నిబంధనలు",
    support: "SwapSpot సహాయం",
    contact: "SwapSpot సంప్రదించండి",
    "account-deletion": "మీ SwapSpot ఖాతాను తొలగించండి",
    "delete-account": "మీ SwapSpot ఖాతాను తొలగించండి",
    helpers: "Helper అవ్వండి",
    "trust-safety": "నమ్మకం మరియు భద్రత",
  },
  ta: {
    privacy: "தனியுரிமைக் கொள்கை",
    terms: "சேவை விதிமுறைகள்",
    support: "SwapSpot உதவி",
    contact: "SwapSpot தொடர்பு",
    "account-deletion": "உங்கள் SwapSpot கணக்கை நீக்கவும்",
    "delete-account": "உங்கள் SwapSpot கணக்கை நீக்கவும்",
    helpers: "Helper ஆகுங்கள்",
    "trust-safety": "நம்பிக்கை மற்றும் பாதுகாப்பு",
  },
};

const localizedIntros: Record<Locale, string> = {
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
};

function isSupportedPage(value: string): value is SupportedPage {
  return supportedPages.includes(value as SupportedPage);
}

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    supportedPages.map((page) => ({ locale, slug: [page] })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale) || slug.length !== 1 || !isSupportedPage(slug[0])) return {};

  const title = localizedTitles[locale][slug[0]];
  const canonicalPage =
    slug[0] === "delete-account" ? "account-deletion" : slug[0];
  return {
    title,
    description: localizedIntros[locale],
    alternates: { canonical: localizedPath(locale, `/${canonicalPage}`) },
  };
}

export default async function LocalizedStaticPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || slug.length !== 1 || !isSupportedPage(slug[0])) notFound();

  const dictionary = dictionaries[locale];
  const page = slug[0];
  const title = localizedTitles[locale][page];

  if (page === "trust-safety") {
    return (
      <>
        <Header locale={locale} dictionary={dictionary} />
        <main className="py-[clamp(32px,5vw,64px)]">
          <TrustSafety dictionary={dictionary} />
        </main>
        <Footer locale={locale} dictionary={dictionary} />
      </>
    );
  }

  return (
    <>
      <Header locale={locale} dictionary={dictionary} />
      <main className="mx-auto max-w-[860px] px-6 py-[clamp(48px,6vw,86px)]">
        <h1 className="font-head text-[clamp(32px,5vw,52px)] font-bold tracking-[-0.02em] text-ink">
          {title}
        </h1>
        <p className="mt-4 text-[18px] leading-[1.6] text-ink-soft">
          {localizedIntros[locale]}
        </p>
        <section className="mt-8 rounded-card-md border border-line bg-surface p-6 shadow-card-sm">
          <h2 className="font-head text-[22px] font-extrabold text-ink">
            SwapSpot
          </h2>
          <p className="mt-3 text-[15.5px] leading-[1.65] text-ink-soft">
            {dictionary.footer.tagline}
          </p>
          <p className="mt-3 text-[15.5px] leading-[1.65] text-ink-soft">
            {dictionary.footer.companyLine}
          </p>
          <a
            href="mailto:hello@swapspot.org"
            className="mt-5 inline-flex rounded-full bg-green px-5 py-3 text-[15px] font-extrabold text-white transition-transform duration-150 hover:-translate-y-0.5 hover:bg-green-deep"
          >
            hello@swapspot.org
          </a>
        </section>
      </main>
      <Footer locale={locale} dictionary={dictionary} />
    </>
  );
}
