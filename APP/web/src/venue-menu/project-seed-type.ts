import localFont from "next/font/local";

// Fraunces, SIL OFL 1.1. Self-hosted and scoped to Project Seed routes.
export const seedDisplay = localFont({
  src: "../../public/fonts/project-seed/fraunces-latin.woff2",
  variable: "--font-seed-display",
  weight: "400 700",
  style: "normal",
  display: "swap",
});
