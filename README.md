# SwapSpot — Next.js (App Router) frontend

Clean, server-render-friendly component structure for the SwapSpot marketing
site. Drop straight into a Next.js 14 App Router project — no bundler output,
no runtime template engine, plain TSX + Tailwind.

```bash
npm install
npm run dev
```

---

## 1. Design system (tokens)

All tokens live in **`tailwind.config.ts`** as named colors, fonts, radii, and
shadows — components read them semantically (`bg-green-deep`, `text-ink-soft`)
instead of raw hex.

### Colors

| Token            | Hex       | Use                                   |
| ---------------- | --------- | ------------------------------------- |
| `sand`           | `#F6F5F0` | warm page background                  |
| `surface`        | `#FFFFFF` | white cards                           |
| `cream`          | `#FBF6EC` | alternate section background          |
| `line`           | `#E8E6DD` | hairline borders                      |
| `ink`            | `#1F2A24` | primary text                          |
| `ink-soft`       | `#5E6E64` | secondary text                        |
| `green`          | `#1B6B45` | primary brand                         |
| `green-deep`     | `#134B30` | hover, footer                         |
| `green-soft`     | `#E6F0E9` | icon chips, tints                     |
| `gold`           | `#C6841E` | accent                                |
| `gold-soft`      | `#F7EAD2` | accent tint / H1 highlight            |
| `gold-deep`      | `#8A5B12` | accent text on light                  |

Light theme only — never dark (per brief).

### Type

- **Headings** → `font-head` = Bricolage Grotesque (700/800, tight tracking)
- **Body / UI** → `font-body` = Hanken Grotesk (400–800)

Loaded via `next/font/google` in `app/layout.tsx` and exposed as the CSS
variables `--font-bricolage` / `--font-hanken` that the Tailwind `fontFamily`
keys point at. No external `<link>` tags, no layout shift.

### Radii & shadow

`rounded-card` (24px) · `rounded-card-md` (16px) · `rounded-card-sm` (12px)
`shadow-card` (elevated) · `shadow-card-sm` (resting)

### Motion

Keyframes `floaty`, `floaty2`, `ping2` are declared in the Tailwind config and
used as `animate-floaty`, `animate-floaty2`, `animate-ping2` (hero only).

---

## 2. Component breakdown

```
app/
  layout.tsx            Fonts + full SEO metadata (title/description/OG/icons)
  page.tsx              Homepage — composes the sections below + JSON-LD
  globals.css           Tailwind layers + resets (the only non-inline CSS)
  sitemap.ts            Static routes + every category, build-time
  robots.ts
  helpers/page.tsx              → /helpers
  categories/[slug]/page.tsx    → /categories/[slug]   (generateStaticParams)
  cities/[slug]/page.tsx        → /cities/[slug]
  trust-safety/page.tsx         → /trust-safety
  blog/page.tsx                 → /blog
  privacy/page.tsx · terms/page.tsx

components/
  ui.tsx           Brand, Button, Eyebrow, SectionHead  (shared primitives)
  Header.tsx       'use client' — sticky nav + mobile menu toggle
  Hero.tsx         H1, social proof, product preview
  PhoneMockup.tsx  Pure-CSS phone + map + bottom sheet (reusable, no images)
  HowItWorks.tsx   3 steps
  ForHelpers.tsx   Supply-side panel + earnings card
  Categories.tsx   10 category cards → link to /categories/[slug]
  TrustSafety.tsx  5 safety cards (reused on /trust-safety)
  AppPreview.tsx   4 product-shot cards (map / profile / booking / chat)
  WaitlistCTA.tsx  'use client' — email form (local state) + store buttons
  Footer.tsx

lib/
  data.ts          steps, perks, categories (with slugs), trustItems, navLinks
```

**Server vs client:** everything is a Server Component except `Header` (menu
toggle) and `WaitlistCTA` (form state) — both marked `"use client"`. This keeps
the homepage HTML fully server-rendered for SEO.

---

## 3. SEO

- `app/layout.tsx` sets the exact **title** `SwapSpot - Find Trusted Local Help
  Near You` and **description** from the brief, plus OpenGraph, Twitter, theme
  color, and an inline SVG favicon. Uses the title `template` so child routes
  render `Page | SwapSpot`.
- Hero `<h1>` is exactly **`Find trusted local help near you`** (the highlighted
  span is inline, so it stays one H1).
- Each section uses a single semantic `<h2>` via `SectionHead`.
- All copy is real product copy — no lorem ipsum.
- `sitemap.ts` + `robots.ts` + per-route `generateMetadata` + Organization
  JSON-LD on the homepage.
- Category & city pages use `generateStaticParams` / canonical URLs so they
  pre-render and index cleanly.

---

## 4. Responsive behavior (mobile-first)

Base styles target mobile; Tailwind breakpoints layer up (`sm` 640, `md` 768,
`lg` 1024).

- **Header:** inline nav links + "Get the app" appear at `md`; below that a
  hamburger toggles a stacked menu (`Header.tsx` client state).
- **Hero:** single column on mobile with the phone preview **first**
  (`order-1`); switches to a 2-col grid at `lg`. Floating review card hides
  under 420px.
- **How it works:** 1 col → 3 cols at `md`.
- **Categories:** 2 → 3 (`sm`) → 5 (`lg`).
- **Trust & Safety:** 2 → 3 (`md`) → 5 (`lg`).
- **App preview:** 1 → 2 (`sm`) → 4 (`lg`); the playful card rotations only
  apply at `sm`+ so mobile stays upright.
- **For Helpers / Waitlist / Footer:** stack to single / 2-col on small screens.
- Type scales fluidly with `clamp()` (headings never drop below readable sizes).
- All tap targets ≥ 44px (buttons, nav toggle, store buttons).

---

## 5. Notes for wiring up

- **Icons:** `lucide-react` (tree-shaken per-import). In `lib/data.ts` icons are
  stored as component references, rendered as `<Icon />` in each section.
- **Waitlist form:** `WaitlistCTA` holds local state and has a `// TODO` where
  you should POST to `/api/waitlist` or call a server action.
- **Content:** `lib/data.ts` is the single source for repeated content — point it
  at your CMS/DB. Category `slug`s already map 1:1 to `/categories/[slug]`.
- **Path alias:** `@/*` → project root (set in `tsconfig.json`).
- **Tailwind v4?** Move the `theme.extend` values into an `@theme` block in
  `globals.css`; component classes stay identical.

---

## Admin analytics dashboard

Admin page:

```txt
/admin/analytics
```

Required Vercel environment variables:

```txt
ANALYTICS_API_SECRET=...
GOOGLE_CLIENT_EMAIL=...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GA4_PROPERTY_ID=...
SEARCH_CONSOLE_SITE_URL=https://www.swapspot.org/
```

For the "AI normalize services" admin action, also add:

```txt
SUPABASE_URL=https://hoohhuqgyaifjglfzanx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the mobile app or browser. It is
server-only and is used only by `/api/admin/services/normalize`.
