import type { Metadata } from "next";
import SeedRushClient from "./SeedRushClient";
import { octoberMenuIsLive } from "../../(internal)/demo/project-seed/menu-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Seed Rush · Project Seed Concept Preview",
  description: "A playable, reward-free coffee game concept for Project Seed Coffee.",
  robots: { index: false, follow: false, nocache: true },
};

export default function SeedRushPage() { return <SeedRushClient octoberLive={octoberMenuIsLive()} />; }
