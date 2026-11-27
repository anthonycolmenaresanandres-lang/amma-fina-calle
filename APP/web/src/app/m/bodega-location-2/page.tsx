import type { Metadata } from "next";
import { SecondLocationMenu } from "./second-location-menu";
import "./second-location.css";

export const metadata: Metadata = {
  title: "Bodega Café | Location 02 Signature Menu",
  description: "Explore the five signature cafecitos at Bodega Café's second location.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function BodegaLocationTwoMenu() {
  return <SecondLocationMenu />;
}
