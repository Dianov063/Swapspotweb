import type { Metadata } from "next";
import ResetPasswordForm, { type RegistryResetStrings } from "./ResetPasswordForm";
import { extraLocaleTables } from "@/lib/extraLocales";
import { getSiteLanguages } from "@/lib/languages";
import { ensureLocaleTables } from "@/lib/localePacks";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new password for your SwapSpot account.",
  alternates: { canonical: "/auth/reset-password" },
  robots: { index: false, follow: false },
};

/** Reset strings of the public registry languages (none until the owner publishes one). */
async function registryResetStrings(): Promise<RegistryResetStrings> {
  const result: RegistryResetStrings = {};
  for (const language of await getSiteLanguages()) {
    if (language.shipped) continue;
    ensureLocaleTables(language);
    const tables = extraLocaleTables(language.segment);
    if (tables) result[language.segment] = { tag: language.tag, dir: language.dir, strings: tables.reset };
  }
  return result;
}

export default async function ResetPasswordPage() {
  return (
    <main className="bg-cream text-ink">
      <section className="mx-auto max-w-wrap px-6 py-[clamp(56px,8vw,96px)]">
        <div className="max-w-xl">
          {/* Heading, texts and form are rendered in the e-mail's language (16 locales + public registry languages). */}
          <ResetPasswordForm registry={await registryResetStrings()} />
        </div>
      </section>
    </main>
  );
}
