import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Inter"',
          '"SF Pro Display"',
          '"Segoe UI"',
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        mono: ['"JetBrains Mono"', '"SFMono-Regular"', "monospace"],
      },
      colors: {
        brand: {
          navy: "#0b111f",
          midnight: "#0f172a",
          blue: "#0a84ff",
          teal: "#00b8a9",
        },
        surface: {
          base: "#ffffff",
          subtle: "#f8fafc",
          muted: "#f1f5f9",
        },
        border: {
          DEFAULT: "#e2e8f0",
          subtle: "#cbd5e1",
        },
        muted: {
          DEFAULT: "#64748b",
          dark: "#334155",
        },
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
      boxShadow: {
        card: "0 28px 60px -40px rgba(15, 23, 42, 0.45)",
        soft: "0 20px 45px -35px rgba(15, 23, 42, 0.55)",
        focus: "0 0 0 4px rgba(10, 132, 255, 0.15)",
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.75rem",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #0a84ff 0%, #00b8a9 100%)",
        "gradient-midnight": "linear-gradient(140deg, #0b111f 0%, #1e293b 100%)",
        "gradient-soft": "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
