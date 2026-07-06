import {
  CalendarCheck,
  CreditCard,
  MapPinned,
  MessageCircle,
  SearchCheck,
  ShieldCheck,
} from "lucide-react";
import { Button, Eyebrow } from "./ui";
import { localizedPath, type Locale } from "@/lib/i18n";

const copy: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    body: string;
    cta: string;
    statA: string;
    statB: string;
    statC: string;
    cards: [string, string][];
    panelTitle: string;
    panelMeta: string;
    panelAction: string;
    panelTotal: string;
    panelSecure: string;
  }
> = {
  en: {
    eyebrow: "For Clients",
    title: "Get the job done without chasing people around",
    body:
      "Open the app, see who is nearby, compare real profiles, message inside SwapSpot, and book when it feels right.",
    cta: "Find local help",
    statA: "Live map",
    statB: "Clear quotes",
    statC: "Safer booking",
    cards: [
      ["Find nearby help", "Search by category, distance, rating, and availability."],
      ["Compare before booking", "See profiles, prices, reviews, photos, and services."],
      ["Chat in one place", "Ask questions, confirm details, and keep quotes organized."],
      ["Book with confidence", "Use reviews, reports, blocks, and account controls when needed."],
    ],
    panelTitle: "Saturday deep clean",
    panelMeta: "Maria R. · 0.8 mi · 4.9 rating",
    panelAction: "Quote ready",
    panelTotal: "$90 total",
    panelSecure: "Secure",
  },
  es: {
    eyebrow: "Para clientes",
    title: "Resuelve el trabajo sin perseguir a nadie",
    body:
      "Abre la app, mira quién está cerca, compara perfiles reales, escribe dentro de SwapSpot y reserva cuando te sientas listo.",
    cta: "Buscar ayuda local",
    statA: "Mapa en vivo",
    statB: "Quotes claros",
    statC: "Reserva segura",
    cards: [
      ["Encuentra ayuda cerca", "Busca por categoría, distancia, rating y disponibilidad."],
      ["Compara antes de reservar", "Mira perfiles, precios, reseñas, fotos y servicios."],
      ["Chatea en un lugar", "Pregunta, confirma detalles y mantén quotes ordenados."],
      ["Reserva con confianza", "Usa reseñas, reportes, bloqueos y controles de cuenta."],
    ],
    panelTitle: "Limpieza profunda sábado",
    panelMeta: "Maria R. · 0.8 mi · rating 4.9",
    panelAction: "Quote listo",
    panelTotal: "$90 total",
    panelSecure: "Seguro",
  },
  zh: {
    eyebrow: "给客户",
    title: "不用反复找人，也能把事情办好",
    body: "打开应用，查看附近 helpers，比较真实资料，在 SwapSpot 内聊天，并在合适的时候预订。",
    cta: "寻找本地帮助",
    statA: "实时地图",
    statB: "清晰 quote",
    statC: "安心预订",
    cards: [
      ["寻找附近帮助", "按类别、距离、评分和可用时间搜索。"],
      ["预订前比较", "查看资料、价格、评价、照片和服务。"],
      ["集中聊天", "提问、确认细节，并管理 quotes。"],
      ["更安心预订", "需要时使用评价、举报、屏蔽和账户控制。"],
    ],
    panelTitle: "周六深度清洁",
    panelMeta: "Maria R. · 0.8 英里 · 4.9 评分",
    panelAction: "Quote 已准备",
    panelTotal: "$90 总计",
    panelSecure: "安全",
  },
  fr: {
    eyebrow: "Pour clients",
    title: "Faites avancer le job sans courir après les gens",
    body:
      "Ouvrez l'app, voyez qui est proche, comparez les profils réels, discutez dans SwapSpot et réservez quand tout est clair.",
    cta: "Trouver de l'aide",
    statA: "Carte en direct",
    statB: "Quotes clairs",
    statC: "Réservation sûre",
    cards: [
      ["Trouvez de l'aide proche", "Cherchez par catégorie, distance, note et disponibilité."],
      ["Comparez avant de réserver", "Voyez profils, prix, avis, photos et services."],
      ["Discutez au même endroit", "Posez vos questions, confirmez les détails et gardez les quotes."],
      ["Réservez avec confiance", "Utilisez avis, signalements, blocages et contrôles de compte."],
    ],
    panelTitle: "Ménage profond samedi",
    panelMeta: "Maria R. · 0.8 mi · note 4.9",
    panelAction: "Quote prêt",
    panelTotal: "$90 total",
    panelSecure: "Sécurisé",
  },
  ru: {
    eyebrow: "Для клиентов",
    title: "Закрывайте задачу без бесконечных поисков исполнителя",
    body:
      "Откройте приложение, посмотрите кто рядом, сравните реальные профили, напишите внутри SwapSpot и бронируйте, когда все понятно.",
    cta: "Найти помощь рядом",
    statA: "Живая карта",
    statB: "Понятные quotes",
    statC: "Спокойная бронь",
    cards: [
      ["Найдите помощь рядом", "Ищите по категории, расстоянию, рейтингу и доступности."],
      ["Сравните до брони", "Смотрите профили, цены, отзывы, фото и услуги."],
      ["Общайтесь в одном месте", "Задавайте вопросы, уточняйте детали и храните quotes."],
      ["Бронируйте спокойнее", "Используйте отзывы, жалобы, блокировки и контроль аккаунта."],
    ],
    panelTitle: "Глубокая уборка в субботу",
    panelMeta: "Maria R. · 0.8 mi · рейтинг 4.9",
    panelAction: "Quote готов",
    panelTotal: "$90 итого",
    panelSecure: "Защищено",
  },
};

const icons = [SearchCheck, MapPinned, MessageCircle, ShieldCheck];

export default function ForClients({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <section id="clients" className="mx-auto max-w-wrap px-6 pb-[clamp(48px,6vw,86px)]">
      <div className="grid items-center gap-[clamp(30px,5vw,58px)] lg:grid-cols-[1fr_1.05fr]">
        <div>
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <h2 className="mt-3.5 font-head text-[clamp(28px,3.6vw,44px)] font-bold leading-[1.08] tracking-[-0.02em] text-ink">
            {t.title}
          </h2>
          <p className="mt-4 max-w-[520px] text-[17px] leading-[1.55] text-ink-soft">
            {t.body}
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {[t.statA, t.statB, t.statC].map((stat) => (
              <div
                key={stat}
                className="rounded-card-sm border border-line bg-surface px-4 py-3 text-[14px] font-extrabold text-green-deep shadow-card-sm"
              >
                {stat}
              </div>
            ))}
          </div>

          <Button href={localizedPath(locale, "/#download")} className="mt-7">
            {t.cta}
          </Button>
        </div>

        <div className="grid gap-4">
          <div className="rounded-card border border-line bg-surface p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="font-head text-[22px] font-extrabold text-ink">
                  {t.panelTitle}
                </div>
                <div className="mt-1 text-[14px] font-semibold text-ink-soft">
                  {t.panelMeta}
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1.5 text-[12px] font-extrabold text-gold-deep">
                <CalendarCheck className="h-4 w-4" />
                {t.panelAction}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-card-sm bg-cream px-4 py-3">
              <span className="text-[14px] font-bold text-ink-soft">{t.panelTotal}</span>
              <span className="inline-flex items-center gap-2 text-[14px] font-extrabold text-green">
                <CreditCard className="h-4 w-4" />
                {t.panelSecure}
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {t.cards.map(([title, text], index) => {
              const Icon = icons[index];
              return (
                <article
                  key={title}
                  className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm"
                >
                  <span className="mb-3 grid h-11 w-11 place-items-center rounded-[13px] bg-green-soft text-green">
                    <Icon className="h-[22px] w-[22px]" />
                  </span>
                  <h3 className="font-head text-[17px] font-bold text-ink">{title}</h3>
                  <p className="mt-1.5 text-[14px] leading-[1.5] text-ink-soft">{text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
