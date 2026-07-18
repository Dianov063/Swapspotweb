import { Check, Clock, LockKeyhole, MessageSquareText, Search } from "lucide-react";
import { Button, Eyebrow } from "./ui";
import { dictionaries, localizedPath, type Locale } from "@/lib/i18n";
import { pricingForCountry } from "@/lib/market";

type ClientPricingCopy = {
    eyebrow: string;
    title: string;
    body: string;
    freeTitle: string;
    freeBody: string;
    unlock: string;
    plans: {
      name: string;
      price: string;
      note: string;
      best?: string;
      features: string[];
      cta: string;
    }[];
    actions: string[];
  };

const copy: Partial<Record<Locale, ClientPricingCopy>> & { en: ClientPricingCopy } = {
  en: {
    eyebrow: "Client Pricing",
    title: "Browse for free. Use a pass when you are ready to act.",
    body:
      "Clients can explore categories and compare helpers without paying. A pass is needed to message, request a quote, or book a helper.",
    freeTitle: "Free browsing",
    freeBody: "See categories, helper previews, service areas, and basic trust signals before choosing a pass.",
    unlock: "A pass unlocks",
    actions: ["Messaging helpers", "Requesting quotes", "Booking jobs"],
    plans: [
      {
        name: "Day Pass",
        price: "$5/day",
        note: "Best for one task, urgent help, or trying SwapSpot.",
        features: ["Message helpers for the day", "Request quotes", "Book when you are ready"],
        cta: "Get Day Pass",
      },
      {
        name: "Client Pro",
        price: "$25/month",
        note: "Best for regular home, family, rental, or business needs.",
        best: "Best value",
        features: ["Monthly access", "Message and request quotes anytime", "Better value after 5 active days"],
        cta: "Start Pro",
      },
    ],
  },
  es: {
    eyebrow: "Precios para clientes",
    title: "Explora gratis. Usa un pass cuando quieras actuar.",
    body:
      "Los clientes pueden ver categorías y comparar helpers sin pagar. Se necesita un pass para escribir, pedir quote o reservar.",
    freeTitle: "Explorar gratis",
    freeBody: "Mira categorías, previews de helpers, áreas de servicio y señales básicas de confianza antes de elegir un pass.",
    unlock: "Un pass desbloquea",
    actions: ["Mensajes a helpers", "Solicitar quotes", "Reservar trabajos"],
    plans: [
      {
        name: "Day Pass",
        price: "$5/día",
        note: "Para una tarea, ayuda urgente o probar SwapSpot.",
        features: ["Escribe a helpers durante el día", "Solicita quotes", "Reserva cuando estés listo"],
        cta: "Obtener Day Pass",
      },
      {
        name: "Client Pro",
        price: "$25/mes",
        note: "Para casa, familia, renta o negocio con necesidades frecuentes.",
        best: "Mejor valor",
        features: ["Acceso mensual", "Mensajes y quotes cuando quieras", "Mejor valor después de 5 días activos"],
        cta: "Empezar Pro",
      },
    ],
  },
  zh: {
    eyebrow: "客户价格",
    title: "免费浏览。准备行动时再使用 pass。",
    body:
      "客户可以免费浏览类别并比较 helpers。发送消息、请求 quote 或预订 helper 时需要 pass。",
    freeTitle: "免费浏览",
    freeBody: "选择 pass 前，可查看类别、helper 预览、服务区域和基础信任信息。",
    unlock: "Pass 解锁",
    actions: ["给 helpers 发消息", "请求 quotes", "预订服务"],
    plans: [
      {
        name: "Day Pass",
        price: "$5/天",
        note: "适合一次任务、紧急帮助或试用 SwapSpot。",
        features: ["当天可联系 helpers", "请求 quotes", "准备好后预订"],
        cta: "获取 Day Pass",
      },
      {
        name: "Client Pro",
        price: "$25/月",
        note: "适合家庭、租房、照护或小生意的常规需求。",
        best: "最划算",
        features: ["月度访问", "随时发消息和请求 quotes", "使用超过 5 天更划算"],
        cta: "开始 Pro",
      },
    ],
  },
  fr: {
    eyebrow: "Tarifs clients",
    title: "Parcourez gratuitement. Utilisez un pass pour agir.",
    body:
      "Les clients peuvent explorer les catégories et comparer les helpers sans payer. Un pass est nécessaire pour écrire, demander un quote ou réserver.",
    freeTitle: "Navigation gratuite",
    freeBody: "Voyez les catégories, aperçus de helpers, zones de service et signaux de confiance avant de choisir un pass.",
    unlock: "Un pass débloque",
    actions: ["Messages aux helpers", "Demandes de quotes", "Réservations"],
    plans: [
      {
        name: "Day Pass",
        price: "$5/jour",
        note: "Pour une tâche, une urgence ou tester SwapSpot.",
        features: ["Écrire aux helpers pour la journée", "Demander des quotes", "Réserver quand tout est prêt"],
        cta: "Obtenir Day Pass",
      },
      {
        name: "Client Pro",
        price: "$25/mois",
        note: "Pour les besoins réguliers maison, famille, location ou business.",
        best: "Meilleure valeur",
        features: ["Accès mensuel", "Messages et quotes à tout moment", "Plus rentable après 5 jours actifs"],
        cta: "Démarrer Pro",
      },
    ],
  },
  ru: {
    eyebrow: "Оплата для клиентов",
    title: "Смотреть можно бесплатно. Pass нужен, когда вы готовы действовать.",
    body:
      "Клиенты могут бесплатно смотреть категории и сравнивать helpers. Pass нужен, чтобы писать, запрашивать quote или бронировать исполнителя.",
    freeTitle: "Бесплатный просмотр",
    freeBody: "До оплаты можно смотреть категории, превью helpers, районы работы и базовые сигналы доверия.",
    unlock: "Pass открывает",
    actions: ["Сообщения helpers", "Запрос quotes", "Бронирование задач"],
    plans: [
      {
        name: "Day Pass",
        price: "$5/день",
        note: "Для одной задачи, срочной помощи или теста SwapSpot.",
        features: ["Пишите helpers в течение дня", "Запрашивайте quotes", "Бронируйте, когда готовы"],
        cta: "Взять Day Pass",
      },
      {
        name: "Client Pro",
        price: "$25/месяц",
        note: "Для регулярных задач дома, семьи, аренды или бизнеса.",
        best: "Выгоднее",
        features: ["Доступ на месяц", "Сообщения и quotes в любое время", "Выгодно уже после 5 активных дней"],
        cta: "Начать Pro",
      },
    ],
  },
};

const actionIcons = [MessageSquareText, Search, LockKeyhole];

export default function ClientPricing({ locale, marketCountry }: { locale: Locale; marketCountry?: string | null }) {
  const dictionary = dictionaries[locale];
  const t =
    copy[locale] ??
    ({
      eyebrow: dictionary.nav.pricing,
      title: dictionary.waitlist.title,
      body: dictionary.waitlist.body,
      freeTitle: dictionary.download.pointB,
      freeBody: dictionary.download.body,
      unlock: dictionary.download.badge,
      actions: [dictionary.download.pointA, dictionary.download.pointB, dictionary.waitlist.noSpam],
      plans: [
        {
          name: "Day Pass",
          price: "$5",
          note: dictionary.waitlist.body,
          features: [dictionary.download.pointB, dictionary.download.pointA, dictionary.waitlist.noSpam],
          cta: dictionary.waitlist.join,
        },
        {
          name: "Client Pro",
          price: "$25",
          note: dictionary.download.body,
          best: dictionary.download.badge,
          features: [dictionary.download.pointA, dictionary.download.pointB, dictionary.waitlist.noSpam],
          cta: dictionary.waitlist.join,
        },
      ],
    } satisfies ClientPricingCopy);

  const pricing = pricingForCountry(marketCountry);
  const localizedPlans = t.plans.map((plan, index) => ({
    ...plan,
    price: index === 0 ? pricing.dayPass : pricing.monthlyPass,
  }));

  return (
    <section id="pricing" className="border-y border-line bg-cream">
      <div className="mx-auto max-w-wrap px-6 py-[clamp(48px,6vw,86px)]">
        <div className="grid gap-[clamp(28px,5vw,56px)] lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <h2 className="mt-3.5 font-head text-[clamp(28px,3.6vw,44px)] font-bold leading-[1.08] tracking-[-0.02em] text-ink">
              {t.title}
            </h2>
            <p className="mt-4 text-[17px] leading-[1.55] text-ink-soft">
              {t.body}
            </p>

            <div className="mt-7 rounded-card-md border border-line bg-surface p-5 shadow-card-sm">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-green-soft text-green">
                  <Search className="h-[22px] w-[22px]" />
                </span>
                <div>
                  <h3 className="font-head text-[19px] font-extrabold text-ink">
                    {t.freeTitle}
                  </h3>
                  <p className="mt-1.5 text-[14.5px] leading-[1.5] text-ink-soft">
                    {t.freeBody}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-line pt-5">
                <div className="mb-3 text-[13px] font-extrabold uppercase tracking-[0.06em] text-green-deep">
                  {t.unlock}
                </div>
                <div className="grid gap-2">
                  {t.actions.map((action, index) => {
                    const Icon = actionIcons[index];
                    return (
                      <div key={action} className="flex items-center gap-2.5 text-[14px] font-bold text-ink">
                        <Icon className="h-4 w-4 text-green" />
                        {action}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {localizedPlans.map((plan) => (
              <article
                key={plan.name}
                className={`relative rounded-card border p-6 shadow-card-sm ${
                  plan.best
                    ? "border-green bg-surface shadow-card"
                    : "border-line bg-surface"
                }`}
              >
                {plan.best ? (
                  <span className="absolute right-5 top-5 rounded-full bg-green px-3 py-1 text-[12px] font-extrabold text-white">
                    {plan.best}
                  </span>
                ) : null}
                <h3 className="font-head text-[24px] font-extrabold text-ink">
                  {plan.name}
                </h3>
                <div className="mt-3 font-head text-[42px] font-extrabold tracking-[-0.02em] text-green-deep">
                  {plan.price}
                </div>
                <p className="mt-2 min-h-[48px] text-[14.5px] leading-[1.5] text-ink-soft">
                  {plan.note}
                </p>
                <div className="mt-6 grid gap-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5 text-[14px] font-semibold text-ink">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                      {feature}
                    </div>
                  ))}
                </div>
                <Button
                  href={localizedPath(locale, "/#download")}
                  variant={plan.best ? "green" : "white"}
                  className="mt-7 w-full justify-center"
                >
                  {plan.best ? <Clock className="h-4 w-4" /> : null}
                  {plan.cta}
                </Button>
              </article>
            ))}
          </div>
        </div>
        <p className="mt-5 text-center text-[13px] font-semibold text-ink-soft">
          Final local price and taxes are shown by the App Store or Google Play before purchase.
        </p>
      </div>
    </section>
  );
}
