import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How SwapSpot collects, uses, and protects your data.",
  alternates: { canonical: "/privacy" },
};

const sections = [
  {
    title: "1. Who we are",
    body: [
      "SwapSpot is operated by USPROJECT LLC, EIN 83-3989558, New York, USA. This Privacy Policy explains how SwapSpot collects, uses, shares, and protects information when you use our website, mobile app, and related services.",
      "For privacy questions, account support, or data requests, contact us at hello@swapspot.org.",
    ],
  },
  {
    title: "2. Information we collect",
    body: [
      "We may collect account information such as your name, email address, phone number, profile photo, account role, ZIP code or service area, and profile details you choose to provide.",
      "We may collect app activity such as searches, saved helpers, bookings, quotes, messages, reports, blocks, reviews, device information, log data, and approximate location information used to show nearby services.",
      "Payments are processed by Stripe. SwapSpot does not store full payment card numbers, CVV codes, or full card details on our servers.",
    ],
  },
  {
    title: "3. Location and addresses",
    body: [
      "SwapSpot is designed to use approximate location, ZIP code, and service area information for discovery and matching. We do not require users to publish a precise home address in a public profile.",
      "If a client and helper decide to move forward, they may exchange a real service address inside chat or another agreed communication flow. Users are responsible for sharing address details only when they are comfortable doing so.",
    ],
  },
  {
    title: "4. How we use information",
    body: [
      "We use information to create and manage accounts, show nearby helpers and services, support messaging, quotes, bookings, reviews, reports, blocks, payments, safety features, customer support, fraud prevention, service improvement, and legal compliance.",
      "We may use contact information to send important account, security, payment, booking, or support messages.",
    ],
  },
  {
    title: "5. Sharing information",
    body: [
      "We may share limited information between clients and helpers when needed to support profiles, messaging, quotes, bookings, reviews, and service coordination.",
      "We may share information with service providers that help us operate SwapSpot, including hosting, database, analytics, customer support, payment processing, security, and communications providers.",
      "We may disclose information if required by law, to protect rights and safety, to investigate abuse or fraud, or as part of a business transfer such as a merger or acquisition.",
    ],
  },
  {
    title: "6. Cookies and analytics",
    body: [
      "Our website uses Google Analytics to understand visits, page usage, device categories, and general traffic trends so we can improve SwapSpot. Google may process device or online identifiers and related usage information under its own privacy terms.",
      "For visitors in the European Economic Area, United Kingdom, and Switzerland, optional analytics and advertising-related storage is denied by default until consent is given. You may accept, reject, or later change your choice using the cookie settings button on the website.",
    ],
  },
  {
    title: "7. Payments",
    body: [
      "Client passes and other payments may be handled through Stripe. Stripe may collect and process payment details under its own privacy policy and terms. SwapSpot receives payment status and related transaction identifiers, but does not store full card details.",
    ],
  },
  {
    title: "8. Messages and safety",
    body: [
      "Messages, quotes, reports, and blocks may be stored so SwapSpot can provide the service, support users, enforce rules, investigate safety issues, and comply with legal obligations.",
      "Users should not share sensitive personal, financial, or identity information in chat unless necessary for a service arrangement and only with people they trust.",
    ],
  },
  {
    title: "9. Account deletion and choices",
    body: [
      "You may request or use in-app account deletion where available. Deleting an account may remove or de-identify account information, while certain records may be retained when needed for safety, fraud prevention, payment records, dispute handling, legal compliance, or legitimate business purposes.",
      "You may contact hello@swapspot.org for help with privacy requests or account deletion questions.",
    ],
  },
  {
    title: "10. Data retention and security",
    body: [
      "We keep information for as long as needed to provide SwapSpot, comply with law, resolve disputes, prevent abuse, enforce agreements, and maintain business records.",
      "We use reasonable administrative, technical, and organizational safeguards. No online service can guarantee complete security.",
    ],
  },
  {
    title: "11. Children",
    body: [
      "SwapSpot is intended for users who are 18 years of age or older. We do not knowingly collect personal information from children under 18.",
    ],
  },
  {
    title: "12. Changes to this policy",
    body: [
      "We may update this Privacy Policy from time to time. The updated version will be posted on this page with a new effective date.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[860px] px-6 py-[clamp(48px,6vw,86px)]">
        <h1 className="font-head text-[clamp(32px,5vw,52px)] font-bold tracking-[-0.02em] text-ink">
          Privacy Policy
        </h1>
        <p className="mt-3 text-[15px] font-semibold text-ink-soft">
          Effective date: July 19, 2026
        </p>
        <p className="mt-6 text-[18px] leading-[1.6] text-ink-soft">
          This Privacy Policy describes how SwapSpot handles information for
          clients, helpers, website visitors, and app users.
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
