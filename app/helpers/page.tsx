import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Become a Helper - Earn Locally",
  description:
    "Turn your skills into local income. Create a profile, set your prices, and get booked by neighbors near you on SwapSpot.",
};

/**
 * /helpers — landing page for the supply side.
 * Reuse <ForHelpers /> plus a dedicated #pricing section here.
 */
export default function HelpersPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-wrap px-6 py-[clamp(48px,6vw,86px)]">
        <h1 className="font-head text-[clamp(32px,5vw,52px)] font-bold tracking-[-0.02em] text-ink">
          Turn your skills into local income
        </h1>
        <p className="mt-4 max-w-[560px] text-[18px] text-ink-soft">
          Placeholder route — drop the For-Helpers content, pricing table, and
          payout FAQ here.
        </p>
      </main>
      <Footer />
    </>
  );
}
