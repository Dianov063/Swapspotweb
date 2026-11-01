import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Account Deletion",
  description:
    "How to delete your SwapSpot account and request deletion of associated account data.",
  alternates: { canonical: "/account-deletion" },
};

const retainedItems = [
  "Payment, fraud prevention, tax, security, dispute, and legal compliance records may be retained where required or permitted by law.",
  "Messages, quotes, bookings, reviews, reports, and blocks may be retained or de-identified when needed for safety, integrity, dispute handling, or to preserve another user's service history.",
  "Full card details are not stored by SwapSpot. Payments are processed by third-party payment providers such as Stripe or app store billing providers.",
];

export default function AccountDeletionPage() {
  return (
    <main className="bg-cream text-ink">
      <section className="mx-auto max-w-wrap px-6 py-[clamp(56px,8vw,96px)]">
        <div className="max-w-3xl">
          <p className="mb-3 text-[13px] font-extrabold uppercase tracking-[0.12em] text-green">
            Account deletion
          </p>
          <h1 className="text-[clamp(38px,6vw,72px)] font-black leading-[0.95] tracking-[-0.03em]">
            Delete your SwapSpot account
          </h1>
          <p className="mt-6 max-w-2xl text-[18px] leading-[1.65] text-ink/72">
            SwapSpot users can request account deletion and deletion of
            associated account data at any time. This page is provided for App
            Store and Google Play users who need a direct account deletion URL.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-[8px] border border-ink/10 bg-white p-6 shadow-sm">
            <h2 className="text-[24px] font-black">Delete in the app</h2>
            <ol className="mt-4 grid gap-3 text-[16px] leading-[1.6] text-ink/74">
              <li>1. Open the SwapSpot app and sign in.</li>
              <li>2. Go to Profile.</li>
              <li>3. Open Settings.</li>
              <li>4. Choose Delete Account and confirm the request.</li>
            </ol>
          </div>

          <div className="rounded-[8px] border border-ink/10 bg-white p-6 shadow-sm">
            <h2 className="text-[24px] font-black">Request by email</h2>
            <p className="mt-4 text-[16px] leading-[1.6] text-ink/74">
              If you cannot access the app, email us from the email address on
              your SwapSpot account and include “Account deletion request” in
              the subject line.
            </p>
            <a
              className="mt-5 inline-flex rounded-full bg-green px-5 py-3 text-[15px] font-extrabold text-white transition-colors hover:bg-green-deep"
              href="mailto:hello@swapspot.org?subject=Account%20deletion%20request"
            >
              hello@swapspot.org
            </a>
          </div>
        </div>

        <div className="mt-8 rounded-[8px] border border-ink/10 bg-white p-6 shadow-sm">
          <h2 className="text-[24px] font-black">What happens after deletion</h2>
          <p className="mt-4 text-[16px] leading-[1.7] text-ink/74">
            We will delete or de-identify account information associated with
            your SwapSpot account, including profile information where deletion
            is available and not legally restricted. Deletion is generally
            processed within 30 days after we verify the request.
          </p>
          <ul className="mt-4 grid gap-3 text-[16px] leading-[1.65] text-ink/74">
            {retainedItems.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
          <p className="mt-5 text-[15px] leading-[1.65] text-ink/62">
            For more details, read our{" "}
            <Link href="/privacy" className="font-bold text-green">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="font-bold text-green">
              Terms of Service
            </Link>
            .
          </p>
        </div>

        <div className="mt-8 rounded-[8px] bg-green-deep p-6 text-white">
          <h2 className="text-[22px] font-black">Operator</h2>
          <p className="mt-3 text-[15.5px] leading-[1.65] text-white/78">
            SwapSpot is operated by USPROJECT LLC, EIN 83-3989558, New York,
            USA. Contact:{" "}
            <a className="font-bold text-white" href="mailto:hello@swapspot.org">
              hello@swapspot.org
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
