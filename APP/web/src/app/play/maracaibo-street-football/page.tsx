import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maracaibo Street Football | Fina Calle OS",
  description: "Play a two-minute, three-a-side match with Lago and Rayo at Maracaibo.",
  alternates: { canonical: "/play/maracaibo-street-football" },
  robots: { index: false, follow: false },
};

export default function MaracaiboStreetFootballPage() {
  return (
    <iframe
      src="/games/maracaibo-street-football/index.html"
      title="Maracaibo Street Football — playable three-a-side match"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100dvh", border: 0, background: "#101112" }}
    />
  );
}
