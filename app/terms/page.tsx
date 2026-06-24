import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of SwapSpot.",
  alternates: { canonical: "/terms" },
};

const sections = [
  {
    title: "1. Agreement",
    body: [
      "These Terms of Service govern your use of SwapSpot, a local marketplace operated by USPROJECT LLC, EIN 83-3989558, New York, USA.",
      "By using SwapSpot, you agree to these Terms. If you do not agree, do not use the service.",
    ],
  },
  {
    title: "2. Eligibility",
    body: [
      "You must be at least 18 years old to use SwapSpot. By creating an account or using the service, you confirm that you are 18 or older and can enter into a binding agreement.",
    ],
  },
  {
    title: "3. What SwapSpot does",
    body: [
      "SwapSpot helps clients discover local helpers, compare profiles, send messages, request quotes, and coordinate bookings.",
      "Helpers are independent users or service providers. SwapSpot is not the employer of helpers and does not control how helpers perform services.",
    ],
  },
  {
    title: "4. Client passes and access",
    body: [
      "Clients may browse categories, view helper previews, and explore the service for free. A paid pass is required to message helpers, request quotes, or book services.",
      "Current client access options may include a Day Pass for $5 per day and Client Pro for $25 per month. Prices, features, and availability may change over time.",
      "Access is considered delivered when the paid pass is activated and the client receives full access to the covered app features for the applicable period.",
    ],
  },
  {
    title: "5. Payments and refunds",
    body: [
      "Payments may be processed through Stripe. SwapSpot does not store full payment card details.",
      "Unless required by law or expressly stated otherwise, client pass purchases are non-refundable once access has been delivered. If you believe there was an error, contact hello@swapspot.org and we will review the issue.",
    ],
  },
  {
    title: "6. User responsibilities",
    body: [
      "You are responsible for the information you provide, the messages you send, the services you request or offer, and the agreements you make with other users.",
      "Do not use SwapSpot for illegal, unsafe, deceptive, abusive, discriminatory, or harmful activity. Do not harass, threaten, spam, impersonate others, or misuse reports and blocks.",
    ],
  },
  {
    title: "7. Location, ZIP codes, and service addresses",
    body: [
      "SwapSpot may use approximate location, ZIP code, or service area information to help clients and helpers find each other. Public profiles should not require a precise home address.",
      "If a client and helper decide to move forward, they may exchange the real service address inside chat or through another agreed process. Users should share exact addresses only when they are comfortable.",
    ],
  },
  {
    title: "8. Quotes, bookings, and services",
    body: [
      "Quotes, prices, schedules, scope of work, and service details are arranged between clients and helpers. Users should confirm all important details before work begins.",
      "SwapSpot may provide tools for messaging, quotes, bookings, reviews, and safety controls, but it does not guarantee the quality, legality, availability, timing, or outcome of services provided by helpers.",
    ],
  },
  {
    title: "9. Reviews, reports, and blocks",
    body: [
      "Users may submit reviews, reports, and blocks. Reviews should be honest and based on real experiences. Reports and blocks may be used to support safety, moderation, and enforcement.",
      "SwapSpot may remove content, limit accounts, suspend access, or take other action if we believe a user violated these Terms or created risk for the platform or other users.",
    ],
  },
  {
    title: "10. Account deletion",
    body: [
      "Where available, users may delete their account in the app. Some records may be retained where needed for payment records, disputes, safety, fraud prevention, legal compliance, or legitimate business purposes.",
    ],
  },
  {
    title: "11. Disclaimers and limitation of liability",
    body: [
      "SwapSpot is provided on an as-is and as-available basis. To the fullest extent permitted by law, we disclaim warranties of merchantability, fitness for a particular purpose, and non-infringement.",
      "To the fullest extent permitted by law, SwapSpot and USPROJECT LLC will not be liable for indirect, incidental, special, consequential, punitive, or lost-profit damages arising from your use of the service or interactions with other users.",
    ],
  },
  {
    title: "12. Contact",
    body: [
      "Questions about these Terms, support, or account issues can be sent to hello@swapspot.org.",
    ],
  },
  {
    title: "13. Changes",
    body: [
      "We may update these Terms from time to time. The updated version will be posted on this page with a new effective date.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[860px] px-6 py-[clamp(48px,6vw,86px)]">
        <h1 className="font-head text-[clamp(32px,5vw,52px)] font-bold tracking-[-0.02em] text-ink">
          Terms of Service
        </h1>
        <p className="mt-3 text-[15px] font-semibold text-ink-soft">
          Effective date: June 24, 2026
        </p>
        <p className="mt-6 text-[18px] leading-[1.6] text-ink-soft">
          These Terms explain the rules for using SwapSpot as a client, helper,
          website visitor, or app user.
        </p>

        <div className="mt-10 grid gap-7">
          {sections.map((section) => (
            <section key={section.title} className="rounded-card-md border border-line bg-surface p-6 shadow-card-sm">
              <h2 className="font-head text-[22px] font-extrabold text-ink">
                {section.title}
              </h2>
              <div className="mt-3 grid gap-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-[15.5px] leading-[1.65] text-ink-soft">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
