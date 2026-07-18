import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#F5F5F3",        // page background
        surface: "#FFFFFF",    // cards
        surface2: "#EFEFEC",   // subtle fills / inputs
        line: "#ECECE9",       // hairlines
        accent: "#3E9B72",     // muted moss green
        "accent-soft": "#EAF4EE",
        muted: "#A0A0A6",      // tertiary text
        fg: "#1B1B1E",         // primary text
        fg2: "#55555C",        // secondary text
      },
    },
  },
  plugins: [],
} satisfies Config;
