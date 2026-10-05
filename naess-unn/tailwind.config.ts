import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: {
    primary: "var(--c-primary)", secondary: "var(--c-secondary)", accent: "var(--c-accent)",
    surface: "var(--c-bg)", ink: "var(--c-text)" },
    fontFamily: { sans: ["Inter", "system-ui", "Segoe UI", "Roboto", "sans-serif"] } } },
} satisfies Config;
