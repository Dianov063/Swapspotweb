import { Noto_Sans_Tifinagh } from "next/font/google";

// Standard Moroccan Tamazight (zgh) is written in Tifinagh, which many devices lack. Self-hosted
// by next/font (OFL, no request to Google at runtime). The class is set on <html> only for a zgh
// page (app/[locale]/layout.tsx) and `preload: false` keeps other pages from fetching it: the
// browser downloads the file only when Tifinagh text is rendered with this family.
// Ethiopic (am, ti) uses system fonts (Windows Nyala/Ebrima, Android Noto Sans Ethiopic, Apple
// Kefa), named in app/globals.css; no web font is downloaded for it.
export const tifinagh = Noto_Sans_Tifinagh({
  subsets: ["tifinagh"],
  weight: "400",
  variable: "--font-tifinagh",
  display: "swap",
  preload: false,
});
