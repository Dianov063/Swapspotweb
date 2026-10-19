import type { Metadata } from "next";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new password for your SwapSpot account.",
  alternates: { canonical: "/auth/reset-password" },
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <main className="bg-cream text-ink">
      <section className="mx-auto max-w-wrap px-6 py-[clamp(56px,8vw,96px)]">
        <div className="max-w-xl">
          {/* Heading, texts and form are rendered in the e-mail's language (16 locales). */}
          <ResetPasswordForm />
        </div>
      </section>
    </main>
  );
}
