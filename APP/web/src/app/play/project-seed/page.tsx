import type { Metadata } from "next";
import SeedRushClient from "./SeedRushClient";

export const metadata: Metadata = {
  title: "Seed Rush · Project Seed Concept Preview",
  description: "A playable, reward-free coffee game concept for Project Seed Coffee.",
  robots: { index: false, follow: false, nocache: true },
};

export default function SeedRushPage() { return <SeedRushClient />; }
