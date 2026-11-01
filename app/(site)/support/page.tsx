import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Get help with your SwapSpot account, bookings, payments, reports, and app questions.",
  alternates: { canonical: "/support" },
};

const topics = [
  "Account access and profile help",
  "Client passes, payments, and billing questions",
  "Messaging, quotes, and booking support",
  "Reports, blocks, safety concerns, and account deletion",
];

export default function SupportPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-wrap px-6 py-[clamp(48px,6vw,86px)]">
        <div className="max-w-[760px]">
          <h1 className="font-head text-[clamp(32px,5vw,52px)] font-bold tracking-[-0.02em] text-ink">
            SwapSpot Support
          </h1>
          <p className="mt-4 text-[18px] leading-[1.55] text-ink-soft">
            Need help with SwapSpot? Send us a message and include the email
            address on your account, the device you use, and a short description
            of the issue.
          </p>
          <a
            href="mailto:hello@swapspot.org"
            className="mt-7 inline-flex rounded-full bg-green px-7 py-4 text-[16px] font-extrabold text-white shadow-card transition-transform duration-150 hover:-translate-y-0.5 hover:bg-green-deep"
          >
            hello@swapspot.org
          </a>
        </div>

        <section className="mt-10 rounded-card border border-line bg-surface p-6 shadow-card-sm">
          <h2 className="font-head text-[24px] font-extrabold text-ink">
            We can help with
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {topics.map((topic) => (
              <div
                key={topic}
                className="rounded-card-sm border border-line bg-cream px-4 py-3 text-[15px] font-bold text-ink"
              >
                {topic}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-card border border-line bg-surface p-6 shadow-card-sm">
          <h2 className="font-head text-[24px] font-extrabold text-ink">
            Company information
          </h2>
          <p className="mt-3 text-[15px] leading-[1.55] text-ink-soft">
            Operating under USPROJECT LLC · EIN 83-3989558 · New York, USA
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
