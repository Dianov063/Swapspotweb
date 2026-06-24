import type { LucideIcon } from "lucide-react";
import {
  MapPin,
  BadgeDollarSign,
  ShieldCheck,
  UserRoundPlus,
  CalendarClock,
  Send,
  Star,
  Sparkles,
  Hammer,
  Wrench,
  Zap,
  Sprout,
  Scissors,
  Truck,
  Dog,
  HeartHandshake,
  GraduationCap,
  MessageCircle,
  ShieldAlert,
  UserX,
  MapPinOff,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Shared content model. In production these come from a CMS / DB.    */
/*  Category & city slugs map 1:1 to the dynamic routes:              */
/*    /categories/[slug]   and   /cities/[slug]                       */
/* ------------------------------------------------------------------ */

export type Step = {
  n: string;
  icon: LucideIcon;
  title: string;
  text: string;
};

export const steps: Step[] = [
  {
    n: "01",
    icon: MapPin,
    title: "Search nearby helpers",
    text: "See trusted local helpers on a live map, sorted by distance and rating.",
  },
  {
    n: "02",
    icon: BadgeDollarSign,
    title: "Compare services & prices",
    text: "Browse profiles, services, and transparent pricing before you commit.",
  },
  {
    n: "03",
    icon: ShieldCheck,
    title: "Book, chat & pay safely",
    text: "Message, get a quote, and pay securely — all inside the app.",
  },
];

export type Perk = { icon: LucideIcon; title: string; text: string };

export const perks: Perk[] = [
  {
    icon: UserRoundPlus,
    title: "Create your service profile",
    text: "List your skills, photos, and work area in minutes.",
  },
  {
    icon: CalendarClock,
    title: "Set your prices & availability",
    text: "You control your rates, radius, and schedule.",
  },
  {
    icon: Send,
    title: "Receive bookings & send quotes",
    text: "Get requests nearby and reply with custom quotes.",
  },
  {
    icon: Star,
    title: "Build reviews & repeat clients",
    text: "Earn ratings that turn first jobs into regulars.",
  },
];

export type Category = {
  slug: string;
  icon: LucideIcon;
  name: string;
  count: number;
};

export const categories: Category[] = [
  { slug: "cleaning", icon: Sparkles, name: "Cleaning", count: 42 },
  { slug: "handyman", icon: Hammer, name: "Handyman", count: 38 },
  { slug: "plumbing", icon: Wrench, name: "Plumbing", count: 21 },
  { slug: "electrical", icon: Zap, name: "Electrical", count: 17 },
  { slug: "lawn-garden", icon: Sprout, name: "Lawn & Garden", count: 29 },
  { slug: "nails-beauty", icon: Scissors, name: "Nails & Beauty", count: 24 },
  { slug: "moving", icon: Truck, name: "Moving", count: 19 },
  { slug: "pet-care", icon: Dog, name: "Pet Care", count: 33 },
  { slug: "senior-care", icon: HeartHandshake, name: "Senior Care", count: 14 },
  { slug: "tutoring", icon: GraduationCap, name: "Tutoring", count: 26 },
];

export const cities = [
  { slug: "new-york", name: "New York" },
  { slug: "miami", name: "Miami" },
  { slug: "los-angeles", name: "Los Angeles" },
  { slug: "chicago", name: "Chicago" },
  { slug: "houston", name: "Houston" },
  { slug: "atlanta", name: "Atlanta" },
];

export type TrustItem = { icon: LucideIcon; title: string; text: string };

export const trustItems: TrustItem[] = [
  {
    icon: Star,
    title: "Verified reviews",
    text: "Real ratings from real neighbors after every job.",
  },
  {
    icon: MessageCircle,
    title: "In-app chat",
    text: "Keep all conversations and quotes in one place.",
  },
  {
    icon: ShieldAlert,
    title: "Report & block",
    text: "Flag or block any user, anytime, no questions asked.",
  },
  {
    icon: UserX,
    title: "Account deletion",
    text: "Delete your account and data whenever you choose.",
  },
  {
    icon: MapPinOff,
    title: "Location privacy",
    text: "Helpers control how their location is shown.",
  },
];

export const navLinks = [
  { href: "/#how", label: "How it works" },
  { href: "/#categories", label: "Categories" },
  { href: "/#helpers", label: "For Helpers" },
  { href: "/#trust", label: "Trust & Safety" },
];
