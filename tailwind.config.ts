import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "brand-primary": "#0B0D0E",
        "brand-accent": "#C6FF4A",
        "brand-secondary": "#1E2528",
        "neutral-background": "#0F1214",
        "text-primary": "#ECEFEA",
        "text-secondary": "#7E8B8F",
        "nav-divider": "#2C3639",
      },
      fontFamily: {
        primary: ["var(--font-display)", "serif"],
        secondary: ["var(--font-body)", "Helvetica", "Arial", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      spacing: {
        "nav-height": "57.6px",
      },
      borderRadius: {
        project: "24px",
      },
      letterSpacing: {
        tightest: "-0.05em",
      },
    },
  },
  plugins: [],
};

export default config;
