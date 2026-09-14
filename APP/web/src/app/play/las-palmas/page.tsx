import type { Metadata } from "next";
import { Alfa_Slab_One } from "next/font/google";
import LasPalmasGame from "./LasPalmasGame";

export const metadata: Metadata = {
  title: "Cantina Shootout · Las Palmas | Fina Calle OS",
  description: "Pick Burrito California or Quesabirria and take five shots in the Las Palmas Cantina Shootout demo.",
  alternates: { canonical: "/play/las-palmas" },
  robots: { index: false, follow: false },
};
const western = Alfa_Slab_One({ subsets: ["latin"], weight: "400", display: "swap", variable: "--font-palmas-western" });

export default function LasPalmasPlayPage() {
  return <div className={western.variable}><LasPalmasGame /></div>;
}
