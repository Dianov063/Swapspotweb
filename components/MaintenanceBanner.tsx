"use client";

import { usePathname } from "next/navigation";
import { maintenanceCopyTable } from "@/lib/copy/maintenance";
import { isLocale } from "@/lib/locales";
import type { RegistryLanguageCopy } from "@/lib/registryLanguageCopy";

// Shown only while SwapSpot moves to its new backend. Turned on by setting
// NEXT_PUBLIC_SITE_MAINTENANCE_BANNER=on in Vercel and redeploying; any other
// value (or none) renders nothing.
const enabled = process.env.NEXT_PUBLIC_SITE_MAINTENANCE_BANNER === "on";

export default function MaintenanceBanner({ registryCopy }: { registryCopy?: RegistryLanguageCopy }) {
  const pathname = usePathname() ?? "/";
  if (!enabled) return null;
  const segment = pathname.split("/").filter(Boolean)[0] ?? "";
  const registry = registryCopy && segment === registryCopy.segment ? registryCopy : null;
  const locale = isLocale(segment) ? segment : "en";
  return (
    <div
      role="status"
      dir={registry ? registry.dir : locale === "ar" ? "rtl" : "ltr"}
      className="bg-amber-100 px-4 py-3 text-center text-sm font-medium text-amber-900"
    >
      {registry ? registry.maintenance : maintenanceCopyTable[locale]}
    </div>
  );
}
