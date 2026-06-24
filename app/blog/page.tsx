import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Tips, neighborhood stories, and product news from SwapSpot.",
};

/**
 * /blog — index. Add /blog/[slug] for posts; both are great SEO surfaces.
 */
export default function BlogPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-wrap px-6 py-[clamp(48px,6vw,86px)]">
        <h1 className="font-head text-[clamp(32px,5vw,52px)] font-bold tracking-[-0.02em] text-ink">
          The SwapSpot blog
        </h1>
        <p className="mt-4 text-[18px] text-ink-soft">
          Placeholder route — render your post list here.
        </p>
      </main>
      <Footer />
    </>
  );
}
