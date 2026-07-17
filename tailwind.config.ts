import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a0b",
        surface: "#141416",
        surface2: "#1d1d20",
        line: "#2a2a2e",
        accent: "#c6ff3f",
        muted: "#8a8a92",
      },
    },
  },
  plugins: [],
} satisfies Config;
