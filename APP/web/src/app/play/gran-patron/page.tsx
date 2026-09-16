import type { Metadata } from "next";
import { Alfa_Slab_One } from "next/font/google";
import GranPatronGame from "./GranPatronGame";
export const metadata: Metadata = {
  title: "Gran Patrón Shootout | Fina Calle",
  description: "Pick Burrito California or Piña Loca. Five shots, one Gran Patrón shootout. A restaurant preview.",
  alternates: { canonical: "/play/gran-patron" }, robots: { index: false, follow: false },
};
const western = Alfa_Slab_One({ subsets: ["latin"], weight: "400", display: "swap", variable: "--font-palmas-western" });
export default function GranPatronPlayPage() { return <div className={western.variable}><GranPatronGame /></div>; }
