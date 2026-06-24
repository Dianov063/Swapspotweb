import Link from "next/link";
import type { ReactNode } from "react";

/* Small shared primitives used across sections. */

export function Brand({
  className = "",
  invert = false,
  href = "/",
}: {
  className?: string;
  invert?: boolean;
  href?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="SwapSpot home"
      className={`flex items-center gap-2.5 ${className}`}
    >
      <span
        className={`grid h-9 w-9 place-items-center rounded-[11px] shadow-card-sm ${
          invert ? "bg-surface text-green" : "bg-green text-surface"
        }`}
      >
        <MapPinGlyph />
      </span>
      <span
        className={`font-head text-[21px] font-extrabold tracking-[-0.02em] ${
          invert ? "text-surface" : "text-ink"
        }`}
      >
        SwapSpot
      </span>
    </Link>
  );
}

/* Inline pin so the wordmark never waits on the icon font/runtime. */
function MapPinGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2c-3.9 0-7 3.1-7 7 0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z"
        fill="currentColor"
      />
      <circle cx="12" cy="9" r="2.6" fill="#1B6B45" />
    </svg>
  );
}

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "green" | "white" | "gold" | "ghost";
  size?: "md" | "sm";
  className?: string;
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  green:
    "bg-green text-surface shadow-card hover:bg-green-deep hover:-translate-y-0.5",
  white:
    "bg-surface text-ink border-[1.5px] border-line shadow-card-sm hover:border-green hover:text-green-deep hover:-translate-y-0.5",
  gold: "bg-gold text-surface shadow-card hover:bg-[#B5772A] hover:-translate-y-0.5",
  ghost: "bg-surface/0 text-green-deep hover:bg-green-soft",
};

export function Button({
  href,
  children,
  variant = "green",
  size = "md",
  className = "",
}: ButtonProps) {
  const pad = size === "sm" ? "px-5 py-2.5 text-[15px]" : "px-7 py-4 text-[16px]";
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-bold leading-none transition-transform duration-150 ${pad} ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

export function Eyebrow({
  children,
  tone = "gold",
}: {
  children: ReactNode;
  tone?: "gold" | "cream";
}) {
  return (
    <span
      className={`text-[13px] font-bold uppercase tracking-[0.12em] ${
        tone === "gold" ? "text-gold" : "text-[#F2C879]"
      }`}
    >
      {children}
    </span>
  );
}

export function SectionHead({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[640px] text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-3.5 font-head text-[clamp(28px,3.6vw,44px)] font-bold leading-[1.08] tracking-[-0.02em] text-ink">
        {title}
      </h2>
      {children ? (
        <p className="mt-4 text-[17px] leading-[1.55] text-ink-soft">{children}</p>
      ) : null}
    </div>
  );
}
