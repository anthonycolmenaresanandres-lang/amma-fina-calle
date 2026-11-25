import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SecondLocationMenu } from "./second-location-menu";
import "./second-location.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Bodega Café | Second location menu preview",
  robots: { index: false, follow: false, nosnippet: true },
  alternates: { canonical: null },
};

export default function SecondLocationPreview() {
  if (process.env.BODEGA_SECOND_LOCATION_PREVIEW !== "1" || process.env.VERCEL || process.env.VERCEL_ENV) {
    notFound();
  }
  return <SecondLocationMenu />;
}

