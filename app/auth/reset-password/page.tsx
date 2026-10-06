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
          <p className="mb-3 text-[13px] font-extrabold uppercase tracking-[0.12em] text-green">Account</p>
          <h1 className="text-[clamp(34px,5vw,56px)] font-black leading-[0.95] tracking-[-0.03em]">Reset your password</h1>
          <p className="mt-5 text-[17px] leading-[1.6] text-ink/72">
            Choose a new password, then sign in to the SwapSpot app with your e-mail and the new password.
          </p>
          <ResetPasswordForm />
        </div>
      </section>
    </main>
  );
}
