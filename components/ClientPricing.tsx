import { Check, Clock, LockKeyhole, MessageSquareText, Search } from "lucide-react";
import { Button, Eyebrow } from "./ui";
import { dictionaries, localizedPath, type Locale } from "@/lib/i18n";
import { getMarket, isActive } from "@/lib/markets";
import { formatPassPrice } from "@/lib/priceFormat";
import { referencePassPrices, type StorePrice } from "@/lib/storePrices";

type ClientPricingCopy = {
    eyebrow: string;
    title: string;
    body: string;
    freeTitle: string;
    freeBody: string;
    unlock: string;
    plans: {
      name: string;
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
        note: "Best for one task, urgent help, or trying SwapSpot.",
        features: ["Message helpers for the day", "Request quotes", "Book when you are ready"],
        cta: "Get Day Pass",
      },
      {
        name: "Client Pro",
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
        note: "Para una tarea, ayuda urgente o probar SwapSpot.",
        features: ["Escribe a helpers durante el día", "Solicita quotes", "Reserva cuando estés listo"],
        cta: "Obtener Day Pass",
      },
      {
        name: "Client Pro",
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
        note: "适合一次任务、紧急帮助或试用 SwapSpot。",
        features: ["当天可联系 helpers", "请求 quotes", "准备好后预订"],
        cta: "获取 Day Pass",
      },
      {
        name: "Client Pro",
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
        note: "Pour une tâche, une urgence ou tester SwapSpot.",
        features: ["Écrire aux helpers pour la journée", "Demander des quotes", "Réserver quand tout est prêt"],
        cta: "Obtenir Day Pass",
      },
      {
        name: "Client Pro",
        note: "Pour les besoins réguliers maison, famille, location ou business.",
        best: "Meilleure valeur",
        features: ["Accès mensuel", "Messages et quotes à tout moment", "Plus rentable après 5 jours actifs"],
        cta: "Démarrer Pro",
      },
    ],
  },
  ru: {
    eyebrow: "Оплата для клиентов",
    title: "Просмотр бесплатный. Платите, только когда готовы связаться.",
    body:
      "Смотрите категории и сравнивайте исполнителей бесплатно. Платный доступ нужен только для переписки, запроса стоимости и бронирования.",
    freeTitle: "Бесплатный просмотр",
    freeBody: "До оплаты можно смотреть категории, профили исполнителей, районы работы, отзывы и цены.",
    unlock: "Платный доступ открывает",
    actions: ["Переписку с исполнителями", "Запрос стоимости", "Бронирование услуг"],
    plans: [
      {
        name: "Доступ на день",
        note: "Для одной задачи, срочной помощи или знакомства со SwapSpot.",
        features: ["Пишите исполнителям в течение дня", "Запрашивайте стоимость", "Бронируйте, когда готовы"],
        cta: "Получить доступ",
      },
      {
        name: "Client Pro",
        note: "Для регулярных задач дома, семьи, аренды или бизнеса.",
        best: "Лучшая цена",
        features: ["Доступ на месяц", "Переписка и запросы стоимости без ограничений", "Выгодно уже после 5 активных дней"],
        cta: "Подключить Pro",
      },
    ],
  },
  vi: {
    eyebrow: "Bảng giá cho khách hàng",
    title: "Xem miễn phí. Dùng pass khi bạn sẵn sàng hành động.",
    body: "Khách hàng có thể xem danh mục và so sánh người trợ giúp miễn phí. Bạn cần pass để nhắn tin, yêu cầu báo giá hoặc đặt lịch.",
    freeTitle: "Xem miễn phí",
    freeBody: "Xem danh mục, hồ sơ người trợ giúp, khu vực phục vụ và thông tin tin cậy cơ bản trước khi chọn pass.",
    unlock: "Pass mở khóa",
    actions: ["Nhắn tin cho người trợ giúp", "Yêu cầu báo giá", "Đặt công việc"],
    plans: [
      { name: "Pass một ngày", note: "Phù hợp cho một công việc, nhu cầu gấp hoặc dùng thử SwapSpot.", features: ["Nhắn tin trong ngày", "Yêu cầu báo giá", "Đặt lịch khi sẵn sàng"], cta: "Mua pass một ngày" },
      { name: "Client Pro", note: "Phù hợp cho nhu cầu thường xuyên của gia đình, nhà cho thuê hoặc doanh nghiệp.", best: "Giá trị tốt nhất", features: ["Truy cập hàng tháng", "Nhắn tin và yêu cầu báo giá bất cứ lúc nào", "Tiết kiệm hơn sau 5 ngày sử dụng"], cta: "Bắt đầu Pro" },
    ],
  },
  th: {
    eyebrow: "ราคาสำหรับลูกค้า",
    title: "ดูได้ฟรี ใช้ pass เมื่อคุณพร้อมดำเนินการ",
    body: "ลูกค้าดูหมวดหมู่และเปรียบเทียบผู้ช่วยได้ฟรี ต้องมี pass เพื่อส่งข้อความ ขอใบเสนอราคา หรือจอง",
    freeTitle: "ดูได้ฟรี",
    freeBody: "ดูหมวดหมู่ โปรไฟล์ผู้ช่วย พื้นที่ให้บริการ และข้อมูลความน่าเชื่อถือก่อนเลือก pass",
    unlock: "Pass ช่วยให้คุณ",
    actions: ["ส่งข้อความหาผู้ช่วย", "ขอใบเสนอราคา", "จองงาน"],
    plans: [
      { name: "Pass หนึ่งวัน", note: "เหมาะสำหรับงานเดียว งานเร่งด่วน หรือทดลองใช้ SwapSpot", features: ["ส่งข้อความได้ตลอดวัน", "ขอใบเสนอราคา", "จองเมื่อคุณพร้อม"], cta: "รับ pass หนึ่งวัน" },
      { name: "Client Pro", note: "เหมาะสำหรับความต้องการประจำของบ้าน ครอบครัว ที่เช่า หรือธุรกิจ", best: "คุ้มค่าที่สุด", features: ["ใช้งานรายเดือน", "ส่งข้อความและขอราคาได้ทุกเมื่อ", "คุ้มขึ้นหลังใช้งาน 5 วัน"], cta: "เริ่ม Pro" },
    ],
  },
};

const actionIcons = [MessageSquareText, Search, LockKeyhole];

type PassPriceCopy = { seeStore: string; referenceNote: string; footnote: string };

// Contract §4.2: a reference price only where it is confirmed in both stores (lib/storePrices.ts),
// otherwise the neutral store text. Every reference price says that the store shows the final price.
const passPriceCopy: Record<Locale, PassPriceCopy> = {
  en: {
    seeStore: "See the current price in the App Store or Google Play",
    referenceNote: "Reference price. The App Store or Google Play shows the final price.",
    footnote: "Final local price and taxes are shown by the App Store or Google Play before purchase.",
  },
  es: {
    seeStore: "Consulta el precio actual en App Store o Google Play",
    referenceNote: "Precio de referencia. App Store o Google Play muestran el precio final.",
    footnote: "El precio local final y los impuestos aparecen en App Store o Google Play antes de la compra.",
  },
  zh: {
    seeStore: "请在 App Store 或 Google Play 查看当前价格",
    referenceNote: "参考价格。最终价格以 App Store 或 Google Play 显示为准。",
    footnote: "购买前，App Store 或 Google Play 会显示最终本地价格和税费。",
  },
  fr: {
    seeStore: "Consultez le prix actuel sur l'App Store ou Google Play",
    referenceNote: "Prix indicatif. L'App Store ou Google Play affiche le prix final.",
    footnote: "Le prix local final et les taxes sont affichés par l'App Store ou Google Play avant l'achat.",
  },
  ru: {
    seeStore: "Актуальная цена — в App Store или Google Play",
    referenceNote: "Ориентировочная цена. Итоговую цену покажет App Store или Google Play.",
    footnote: "Итоговую цену в вашей стране и налоги покажет App Store или Google Play перед покупкой.",
  },
  ar: {
    seeStore: "اطّلع على السعر الحالي في App Store أو Google Play",
    referenceNote: "سعر استرشادي. يعرض App Store أو Google Play السعر النهائي.",
    footnote: "يعرض App Store أو Google Play السعر المحلي النهائي والضرائب قبل الشراء.",
  },
  pt: {
    seeStore: "Veja o preço atual na App Store ou no Google Play",
    referenceNote: "Preço de referência. A App Store ou o Google Play mostram o preço final.",
    footnote: "O preço local final e os impostos aparecem na App Store ou no Google Play antes da compra.",
  },
  ht: {
    seeStore: "Gade pri aktyèl la nan App Store oswa Google Play",
    referenceNote: "Pri referans. App Store oswa Google Play ap montre pri final la.",
    footnote: "App Store oswa Google Play ap montre pri lokal final la ak taks yo anvan ou achte.",
  },
  de: {
    seeStore: "Den aktuellen Preis finden Sie im App Store oder bei Google Play",
    referenceNote: "Richtpreis. Den endgültigen Preis zeigt der App Store oder Google Play.",
    footnote: "Der endgültige lokale Preis und Steuern werden vor dem Kauf im App Store oder bei Google Play angezeigt.",
  },
  fil: {
    seeStore: "Tingnan ang kasalukuyang presyo sa App Store o Google Play",
    referenceNote: "Reference na presyo. Ang App Store o Google Play ang magpapakita ng huling presyo.",
    footnote: "Ipinapakita ng App Store o Google Play ang huling lokal na presyo at buwis bago bumili.",
  },
  hi: {
    seeStore: "मौजूदा कीमत App Store या Google Play में देखें",
    referenceNote: "संदर्भ कीमत। अंतिम कीमत App Store या Google Play दिखाता है।",
    footnote: "खरीद से पहले App Store या Google Play अंतिम स्थानीय कीमत और कर दिखाता है।",
  },
  bn: {
    seeStore: "বর্তমান মূল্য App Store বা Google Play-তে দেখুন",
    referenceNote: "রেফারেন্স মূল্য। চূড়ান্ত মূল্য App Store বা Google Play দেখাবে।",
    footnote: "কেনার আগে App Store বা Google Play চূড়ান্ত স্থানীয় মূল্য ও কর দেখায়।",
  },
  te: {
    seeStore: "ప్రస్తుత ధరను App Store లేదా Google Playలో చూడండి",
    referenceNote: "సూచన ధర. తుది ధరను App Store లేదా Google Play చూపిస్తుంది.",
    footnote: "కొనుగోలుకు ముందు App Store లేదా Google Play తుది స్థానిక ధర మరియు పన్నులను చూపిస్తుంది.",
  },
  ta: {
    seeStore: "தற்போதைய விலையை App Store அல்லது Google Play-இல் பார்க்கவும்",
    referenceNote: "குறிப்பு விலை. இறுதி விலையை App Store அல்லது Google Play காட்டும்.",
    footnote: "வாங்குவதற்கு முன் App Store அல்லது Google Play இறுதி உள்ளூர் விலையையும் வரிகளையும் காட்டும்.",
  },
  vi: {
    seeStore: "Xem giá hiện tại trên App Store hoặc Google Play",
    referenceNote: "Giá tham khảo. App Store hoặc Google Play sẽ hiển thị giá cuối cùng.",
    footnote: "App Store hoặc Google Play hiển thị giá địa phương cuối cùng và thuế trước khi mua.",
  },
  th: {
    seeStore: "ดูราคาปัจจุบันได้ใน App Store หรือ Google Play",
    referenceNote: "ราคาอ้างอิง ราคาสุดท้ายจะแสดงใน App Store หรือ Google Play",
    footnote: "App Store หรือ Google Play จะแสดงราคาท้องถิ่นสุดท้ายและภาษีก่อนการซื้อ",
  },
};

export default async function ClientPricing({ locale, marketCountry }: { locale: Locale; marketCountry?: string | null }) {
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
          note: dictionary.waitlist.body,
          features: [dictionary.download.pointB, dictionary.download.pointA, dictionary.waitlist.noSpam],
          cta: dictionary.waitlist.join,
        },
        {
          name: "Client Pro",
          note: dictionary.download.body,
          best: dictionary.download.badge,
          features: [dictionary.download.pointA, dictionary.download.pointB, dictionary.waitlist.noSpam],
          cta: dictionary.waitlist.join,
        },
      ],
    } satisfies ClientPricingCopy);

  const priceCopy = passPriceCopy[locale] ?? passPriceCopy.en;
  // Unknown, absent or inactive country: neutral text, never a US price.
  const market = await getMarket(marketCountry);
  const reference = referencePassPrices(marketCountry, isActive(market));
  const priceFor = (price: StorePrice | undefined, period: "day" | "month") =>
    price ? formatPassPrice(price.amount, price.currency, locale, period) : null;
  const localizedPlans = t.plans.map((plan, index) => ({
    ...plan,
    price: index === 0 ? priceFor(reference?.dayPass, "day") : priceFor(reference?.monthlyPass, "month"),
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
                {plan.price ? (
                  <>
                    <div className="mt-3 font-head text-[42px] font-extrabold tracking-[-0.02em] text-green-deep">
                      {plan.price}
                    </div>
                    <p className="mt-1 text-[12.5px] font-semibold text-ink-soft">{priceCopy.referenceNote}</p>
                  </>
                ) : (
                  <div className="mt-3 text-[17px] font-extrabold leading-[1.35] text-green-deep">
                    {priceCopy.seeStore}
                  </div>
                )}
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
          {priceCopy.footnote}
        </p>
      </div>
    </section>
  );
}
