import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact SwapSpot and view company information.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-wrap px-6 py-[clamp(48px,6vw,86px)]">
        <div className="max-w-[760px]">
          <h1 className="font-head text-[clamp(32px,5vw,52px)] font-bold tracking-[-0.02em] text-ink">
            Contact SwapSpot
          </h1>
          <p className="mt-4 text-[18px] leading-[1.55] text-ink-soft">
            Questions about SwapSpot, partnerships, account support, or business
            information can be sent to the team.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <section className="rounded-card border border-line bg-surface p-6 shadow-card-sm">
            <h2 className="font-head text-[22px] font-extrabold text-ink">
              Company
            </h2>
            <dl className="mt-5 grid gap-4 text-[15px]">
              <div>
                <dt className="font-extrabold text-ink">Operating company</dt>
                <dd className="mt-1 text-ink-soft">USPROJECT LLC</dd>
              </div>
              <div>
                <dt className="font-extrabold text-ink">EIN</dt>
                <dd className="mt-1 text-ink-soft">83-3989558</dd>
              </div>
              <div>
                <dt className="font-extrabold text-ink">Location</dt>
                <dd className="mt-1 text-ink-soft">New York, USA</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-card border border-line bg-surface p-6 shadow-card-sm">
            <h2 className="font-head text-[22px] font-extrabold text-ink">
              Support
            </h2>
            <p className="mt-3 text-[15px] leading-[1.55] text-ink-soft">
              For account help, app questions, trust and safety issues, or
              business inquiries, email the SwapSpot team.
            </p>
            <a
              href="mailto:hello@swapspot.org"
              className="mt-5 inline-flex rounded-full bg-green px-5 py-3 text-[15px] font-extrabold text-white transition-transform duration-150 hover:-translate-y-0.5 hover:bg-green-deep"
            >
              hello@swapspot.org
            </a>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
