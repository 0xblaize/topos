import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#090b0d",
        panel: "#11161a",
        line: "#2b3439",
        signal: "#c6ff4a",
        mist: "#e9e8e2",
        muted: "#8d999d",
        cyan: "#61e5ff",
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "Arial", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
