import type { Config } from "tailwindcss";

/**
 * SwapSpot design tokens.
 * Brand palette: forest green + warm sand background + gold accents.
 * Colors intentionally override Tailwind defaults so components read
 * semantically (bg-sand, text-ink, bg-green-deep) instead of hex values.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: "#F6F5F0", // warm page background
        surface: "#FFFFFF", // white cards
        cream: "#FBF6EC", // alt section background (surface-2)
        line: "#E8E6DD", // hairline borders
        ink: {
          DEFAULT: "#1F2A24", // primary text
          soft: "#5E6E64", // secondary text
        },
        green: {
          DEFAULT: "#1B6B45", // primary brand
          deep: "#134B30", // hover / footer
          soft: "#E6F0E9", // tints, icon chips
        },
        gold: {
          DEFAULT: "#C6841E", // accent
          soft: "#F7EAD2", // accent tint
          deep: "#8A5B12", // accent text on light
        },
      },
      fontFamily: {
        head: ["var(--font-bricolage)", "system-ui", "sans-serif"],
        body: ["var(--font-hanken)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "24px",
        "card-md": "16px",
        "card-sm": "12px",
      },
      boxShadow: {
        card: "0 14px 40px rgba(31,42,36,.12)",
        "card-sm": "0 5px 18px rgba(31,42,36,.08)",
      },
      maxWidth: {
        wrap: "1180px",
      },
      keyframes: {
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        floaty2: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(10px)" },
        },
        ping2: {
          "0%,100%": { transform: "scale(1)", opacity: "0.7" },
          "50%": { transform: "scale(1.5)", opacity: "0" },
        },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        floaty2: "floaty2 7s ease-in-out infinite",
        ping2: "ping2 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
