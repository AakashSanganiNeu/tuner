import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#080d16",
        panel: "#121a29",
        panelSoft: "#182338",
        accent: "#2bd2a6",
        accentSoft: "#145d4d",
        warning: "#ffb347",
        danger: "#ff6b6b",
        info: "#72a9ff"
      },
      keyframes: {
        pulseCenter: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.85" },
          "50%": { transform: "scale(1.06)", opacity: "1" }
        },
        driftIn: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        pulseCenter: "pulseCenter 1.2s ease-in-out infinite",
        driftIn: "driftIn 450ms ease-out"
      },
      boxShadow: {
        tuner: "0 24px 60px rgba(0, 0, 0, 0.42)",
        glow: "0 0 0 1px rgba(43, 210, 166, 0.25), 0 0 28px rgba(43, 210, 166, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
