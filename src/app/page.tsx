import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Categories from "@/components/landing/Categories";
import ForHelpers from "@/components/landing/ForHelpers";
import TrustSection from "@/components/landing/TrustSection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <Categories />
      <ForHelpers />
      <TrustSection />
      <Footer />
    </main>
  );
}
