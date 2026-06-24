import type { Metadata } from "next";
import Header from "@/components/Header";
import TrustSafety from "@/components/TrustSafety";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Trust & Safety",
  description:
    "How SwapSpot keeps neighbors safe: verified reviews, private in-app chat, reporting tools, and full data control.",
};

export default function TrustSafetyPage() {
  return (
    <>
      <Header />
      <main>
        <TrustSafety />
      </main>
      <Footer />
    </>
  );
}
